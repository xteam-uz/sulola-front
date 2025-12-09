<?php

/**
 * Backend Fix: userTests metodini tuzatish
 * TestTypeEnum integer qiymatlaridan foydalanish
 * 
 * Bu kodni TestResultController yoki tegishli controller'ga qo'shing
 * 
 * use App\Enums\TestTypeEnum;
 */

public function userTests(Request $request)
{
    $validator = Validator::make($request->all(), [
        'user_id' => 'required|exists:bot_users,user_id',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'message' => 'Validatsiya xatosi',
            'errors' => $validator->errors(),
        ], 422);
    }

    // Query builder
    $testResults = TestResult::select([
        'users.first_name',
        'users.last_name',
        'tests.name',
        'tests.code',
        'tests.start_time',
        'tests.end_time',
        'tests.type', // Test type ni qo'shish (integer)
        'science.name as science_name',
        'test_results.user_answer',
        'test_results.duration',
        'test_results.correct_count',
        'test_results.total_count'
    ])
        ->leftJoin('users', 'users.id', '=', 'test_results.user_id')
        ->leftJoin('bot_users', 'bot_users.id', '=', 'users.telegram_user_id')
        ->leftJoin('tests', 'tests.id', '=', 'test_results.test_id')
        ->leftJoin('science', 'science.id', '=', 'tests.science_id')
        ->where('bot_users.user_id', $request->user_id)
        ->orderBy('test_results.created_at', 'desc');

    // Pagination
    $paginatedResults = $testResults->paginate();

    // Har bir result uchun user_answer ni results ga o'zgartirish va upload_id larni URL ga o'zgartirish
    $paginatedResults->getCollection()->transform(function ($item) {
        if ($item->user_answer) {
            // Model'da $casts da user_answer => 'array' bo'lgani uchun
            // allaqachon array sifatida keladi, json_decode() kerak emas
            $userAnswer = $item->user_answer;

            // Agar array bo'lmasa yoki bo'sh bo'lsa
            if (!is_array($userAnswer) || empty($userAnswer)) {
                $item->results = $userAnswer;
                return $item;
            }

            // Test type ni aniqlash - integer bilan ishlash
            // Agar user_answer ichida type bo'lsa, uni integer ga o'tkazish
            $testType = null;
            if (isset($userAnswer['type'])) {
                // Agar string bo'lsa, integer ga o'tkazish
                if (is_string($userAnswer['type'])) {
                    $typeMap = [
                        'rash' => TestTypeEnum::RASH_TEST,
                        'blok' => TestTypeEnum::BLOK_TEST,
                        'ochiq-test' => TestTypeEnum::OCHIQ_TEST,
                        'ochiq' => TestTypeEnum::OCHIQ_TEST,
                        'yopiq-test' => TestTypeEnum::YOPIQ_TEST,
                        'yopiq' => TestTypeEnum::YOPIQ_TEST,
                        'atestatsiya' => TestTypeEnum::ATTESTATSIYA,
                        'atestat' => TestTypeEnum::ATTESTATSIYA,
                    ];
                    $normalizedType = strtolower(trim($userAnswer['type']));
                    $testType = $typeMap[$normalizedType] ?? null;
                } else {
                    // Agar integer bo'lsa, to'g'ridan-to'g'ri ishlatish
                    $testType = $userAnswer['type'];
                }
            } else {
                // Agar user_answer ichida type bo'lmasa, tests jadvalidagi type dan olish
                $testType = $item->type ?? null;
            }

            // Atestatsiya test uchun questions_1_50 ni qayta ishlash
            if ($testType === TestTypeEnum::ATTESTATSIYA && isset($userAnswer['questions_1_50'])) {
                // questions_1_50 uchun hech qanday o'zgartirish kerak emas
                // Faqat results nomi bilan qaytarish
                $item->results = $userAnswer;
                return $item;
            }

            // DTM test (rash test) uchun questions_36_45 ni qayta ishlash
            if (isset($userAnswer['questions_36_45']['images']) &&
                isset($userAnswer['questions_36_45']['mode']) &&
                $userAnswer['questions_36_45']['mode'] === 'image') {

                foreach ($userAnswer['questions_36_45']['images'] as $qNum => $imageData) {
                    if (isset($imageData['upload_id'])) {
                        $upload = Upload::find($imageData['upload_id']);
                        if ($upload) {
                            // Rasm URL ni olish
                            $filePath = $upload->file_path ?? $upload->path ?? null;
                            if ($filePath) {
                                $userAnswer['questions_36_45']['images'][$qNum] = [
                                    'upload_id' => $imageData['upload_id'],
                                    'url' => asset('storage/' . $filePath),
                                    // yoki: Storage::url($filePath)
                                    // yoki: $upload->url (agar model'da accessor bo'lsa)
                                ];
                            } else {
                                // Agar file_path topilmasa, upload_id ni saqlab qolish
                                $userAnswer['questions_36_45']['images'][$qNum] = [
                                    'upload_id' => $imageData['upload_id'],
                                ];
                            }
                        }
                    }
                }
            }

            // results nomi bilan qaytarish (frontend uchun)
            $item->results = $userAnswer;
        } else {
            // Agar user_answer bo'lmasa, bo'sh array qaytarish
            $item->results = [];
        }

        return $item;
    });

    return response()->json([
        'status' => true,
        'message' => "Qatnashgan testlar ro'yhati.",
        'results' => $paginatedResults,
    ]);
}

