<?php

/**
 * Backend Fix: saveResult metodini tuzatish
 * TestTypeEnum integer qiymatlaridan foydalanish
 * 
 * Bu kodni TestResultController yoki tegishli controller'ga qo'shing
 * 
 * use App\Enums\TestTypeEnum;
 * use App\Models\Test;
 * use App\Models\TestResult;
 * use App\Models\User;
 * use Illuminate\Support\Facades\DB;
 * use Illuminate\Support\Facades\Validator;
 */

public function saveResult(Request $request)
{
    $validator = Validator::make($request->all(), [
        'test_code' => 'required|exists:tests,code',
        'user_id' => 'required|exists:bot_users,user_id',
        'results' => 'required|array',
        'duration' => 'required|integer|min:0',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'message' => 'Validatsiya xatosi',
            'errors' => $validator->errors(),
        ], 422);
    }

    try {
        DB::beginTransaction();

        $testCode = $request->test_code;
        $userId = $request->user_id;
        $results = $request->results;
        $duration = $request->duration;

        $testId = Test::where('code', $testCode)->value('id');
        if (!$testId) {
            return response()->json([
                'status' => false,
                'message' => 'Bunday test mavjud emas.',
            ], 422);
        }

        $userId = User::select('users.id')
            ->leftJoin('bot_users', 'bot_users.id', '=', 'users.telegram_user_id')
            ->where('bot_users.user_id', $userId)
            ->value('id');
        if (!$userId) {
            return response()->json([
                'status' => false,
                'message' => 'Bunday user mavjud emas.',
            ], 422);
        }

        $testResult = TestResult::where('test_id', $testId)
            ->where('user_id', $userId);

        if ($testResult->exists()) {
            return response()->json([
                'status' => false,
                'message' => 'Ushbu testda qatnashgansiz.',
            ], 422);
        }

        // Test type ni tekshirish - TestTypeEnum integer qiymatlaridan foydalanish
        if (!isset($results['type']) || !in_array($results['type'], TestTypeEnum::LIST)) {
            return response()->json([
                'status' => false,
                'message' => "Test turi noto'g'ri.",
            ], 422);
        }

        $test_type = $results['type']; // Integer qiymat (100, 200, 300, 400, 500)

        // Test type ga qarab metod chaqirish
        if ($test_type == TestTypeEnum::RASH_TEST) {
            $this->rashTestSaved($testId, $userId, $duration, $results);
        }

        if ($test_type == TestTypeEnum::BLOK_TEST) {
            $this->blockTestSaved($testId, $userId, $duration, $results);
        }

        if ($test_type == TestTypeEnum::OCHIQ_TEST) {
            $this->openTestSaved($testId, $userId, $duration, $results);
        }

        if ($test_type == TestTypeEnum::YOPIQ_TEST) {
            $this->closeTestSaved($testId, $userId, $duration, $results);
        }

        if ($test_type == TestTypeEnum::ATTESTATSIYA) {
            $this->atestatsiyaTestSaved($testId, $userId, $duration, $results);
        }

        DB::commit();

        return response()->json([
            'status' => true,
            'message' => 'Test natijalari muvaffaqiyatli saqlandi',
            'data' => [
                'test_id' => $testId,
                'user_id' => $userId,
            ],
        ], 201);
    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'status' => false,
            'message' => 'Test natijalarini saqlashda xatolik yuz berdi',
            'error' => $e->getMessage(),
        ], 500);
    }
}

/**
 * Atestatsiya test natijalarini saqlash
 * 
 * @param int $testId
 * @param int $userId
 * @param int $duration
 * @param array $results
 * @return void
 */
private function atestatsiyaTestSaved($testId, $userId, $duration, $results)
{
    // questions_1_50 ni qayta ishlash
    $questions_1_50 = $results['questions_1_50'] ?? [];
    
    // To'g'ri javoblar sonini hisoblash
    $correctCount = 0;
    $totalCount = count($questions_1_50);
    
    // Test ma'lumotlarini olish
    $test = Test::find($testId);
    if ($test && isset($test->details['questions_1_50'])) {
        $correctAnswers = $test->details['questions_1_50'];
        
        foreach ($questions_1_50 as $qNum => $userAnswer) {
            // User javobini olish
            $userAnswerValue = null;
            if (is_array($userAnswer)) {
                $userAnswerValue = $userAnswer['correct_answer'] ?? $userAnswer['answer'] ?? null;
            } else {
                $userAnswerValue = $userAnswer;
            }
            
            // To'g'ri javobni olish
            $correctAnswerValue = null;
            if (isset($correctAnswers[$qNum])) {
                $correctAnswer = $correctAnswers[$qNum];
                if (is_array($correctAnswer)) {
                    $correctAnswerValue = $correctAnswer['correct_answer'] ?? $correctAnswer['answer'] ?? null;
                } else {
                    $correctAnswerValue = $correctAnswer;
                }
            }
            
            // Javoblarni solishtirish
            if ($userAnswerValue && $correctAnswerValue) {
                if (strtoupper(trim($userAnswerValue)) === strtoupper(trim($correctAnswerValue))) {
                    $correctCount++;
                }
            }
        }
    }
    
    // Result maydonini tayyorlash (test natijalari)
    $result = [
        'type' => TestTypeEnum::ATTESTATSIYA,
        'correct_count' => $correctCount,
        'total_count' => $totalCount,
        'percentage' => $totalCount > 0 ? round(($correctCount / $totalCount) * 100, 2) : 0,
    ];
    
    // TestResult yaratish
    TestResult::create([
        'test_id' => $testId,
        'user_id' => $userId,
        'user_answer' => $results,
        'result' => $result,
        'duration' => $duration,
        'correct_count' => $correctCount,
        'total_count' => $totalCount,
    ]);
}

