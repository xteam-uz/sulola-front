<?php

// TestResultController.php yoki qaysi controller'da /test/results endpoint bor bo'lsa

// 477-qatordagi xatoni tuzatish:
// ESKI KOD (xato):
// $userAnswer = json_decode($item->user_answer, true); // Xato! user_answer allaqachon array

// YANGI KOD (to'g'ri):
$paginatedResults->getCollection()->transform(function ($item) {
    if ($item->user_answer) {
        // Model'da $casts da user_answer => 'array' bo'lgani uchun
        // allaqachon array sifatida keladi, json_decode() kerak emas
        $userAnswer = $item->user_answer;
        
        // Agar array bo'lmasa yoki bo'sh bo'lsa
        if (!is_array($userAnswer) || empty($userAnswer)) {
            return $item;
        }
        
        // questions_36_45.images ichidagi upload_id larni URL ga o'zgartirish
        if (isset($userAnswer['questions_36_45']['images']) && 
            isset($userAnswer['questions_36_45']['mode']) &&
            $userAnswer['questions_36_45']['mode'] === 'image') {
            foreach ($userAnswer['questions_36_45']['images'] as $qNum => $imageData) {
                if (isset($imageData['upload_id'])) {
                    $upload = \App\Models\Upload::find($imageData['upload_id']);
                    if ($upload) {
                        // Rasm URL ni olish (Laravel Storage yoki asset)
                        // Sizning loyihangizga mos ravishda o'zgartiring
                        $userAnswer['questions_36_45']['images'][$qNum] = [
                            'upload_id' => $imageData['upload_id'],
                            'url' => asset('storage/' . $upload->file_path), 
                            // yoki: Storage::url($upload->file_path)
                            // yoki: $upload->url (agar model'da accessor bo'lsa)
                        ];
                    }
                }
            }
        }
        
        // results nomi bilan qaytarish
        $item->results = $userAnswer;
    }
    return $item;
});

// To'liq misol:
public function getUserTestResults(Request $request)
{
    $testResults = TestResult::select([
        'users.first_name', 
        'users.last_name', 
        'tests.name', 
        'tests.code', 
        'tests.start_time', 
        'tests.end_time', 
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
    ->where('bot_users.user_id', $request->user_id);

    $paginatedResults = $testResults->paginate();

    // Har bir result uchun user_answer ni results ga o'zgartirish
    $paginatedResults->getCollection()->transform(function ($item) {
        if ($item->user_answer) {
            // Model'da $casts da user_answer => 'array' bo'lgani uchun
            // allaqachon array sifatida keladi, json_decode() kerak emas
            $userAnswer = $item->user_answer;
            
            // Agar array bo'lmasa yoki bo'sh bo'lsa
            if (!is_array($userAnswer) || empty($userAnswer)) {
                return $item;
            }
            
            // questions_36_45.images ichidagi upload_id larni URL ga o'zgartirish
            if (isset($userAnswer['questions_36_45']['images']) && 
                isset($userAnswer['questions_36_45']['mode']) &&
                $userAnswer['questions_36_45']['mode'] === 'image') {
                foreach ($userAnswer['questions_36_45']['images'] as $qNum => $imageData) {
                    if (isset($imageData['upload_id'])) {
                        $upload = \App\Models\Upload::find($imageData['upload_id']);
                        if ($upload) {
                            // Rasm URL ni olish
                            $userAnswer['questions_36_45']['images'][$qNum] = [
                                'upload_id' => $imageData['upload_id'],
                                'url' => asset('storage/' . $upload->file_path), 
                            ];
                        }
                    }
                }
            }
            
            // results nomi bilan qaytarish
            $item->results = $userAnswer;
        }
        return $item;
    });

    return response()->json([
        'status' => true,
        'message' => "Qatnashgan testlar ro'yhati.",
        'results' => $paginatedResults,
    ]);
}

