# Backend O'zgarishlar

## 1. `/test/results` Endpoint - Controller o'zgarishi (ASOSIY)

Backend controller'da `user_answer` ni `results` nomi bilan qaytarish kerak va `upload_id` dan rasm URL ni qo'shish:

```php
// Controller'da (masalan: TestResultController.php yoki boshqa controller)
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
        'test_results.user_answer', // Qo'shildi
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

    // Har bir result uchun user_answer ni results ga o'zgartirish va upload_id larni URL ga o'zgartirish
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
            // user_answer ni olib tashlash (ixtiyoriy)
            // unset($item->user_answer);
        }
        return $item;
    });

    return response()->json([
        'status' => true,
        'message' => "Qatnashgan testlar ro'yhati.",
        'results' => $paginatedResults,
    ]);
}
```

## 2. Rasm URL olish uchun endpoint (agar kerak bo'lsa)

Agar `upload_id` dan rasm URL olish kerak bo'lsa, yangi endpoint qo'shish:

```php
// routes/api.php
Route::get('/uploads/{uploadId}/url', [UploadController::class, 'getUploadUrl']);

// UploadController.php
public function getUploadUrl($uploadId)
{
    $upload = Upload::find($uploadId);
    if (!$upload) {
        return response()->json(['error' => 'Upload not found'], 404);
    }

    return response()->json([
        'success' => true,
        'url' => asset('storage/' . $upload->file_path), // yoki boshqa path
        // yoki
        'url' => Storage::url($upload->file_path),
    ]);
}
```

## 3. Yoki: user_answer ichida to'g'ridan-to'g'ri rasm URL qaytarish

Agar rasm URL ni to'g'ridan-to'g'ri qaytarish mumkin bo'lsa, `user_answer` ni transform qilish:

```php
$paginatedResults->getCollection()->transform(function ($item) {
    if ($item->user_answer) {
        $userAnswer = json_decode($item->user_answer, true);

        // questions_36_45.images ichidagi upload_id larni URL ga o'zgartirish
        if (isset($userAnswer['questions_36_45']['images'])) {
            foreach ($userAnswer['questions_36_45']['images'] as $qNum => $imageData) {
                if (isset($imageData['upload_id'])) {
                    $upload = Upload::find($imageData['upload_id']);
                    if ($upload) {
                        $userAnswer['questions_36_45']['images'][$qNum] = [
                            'upload_id' => $imageData['upload_id'],
                            'url' => asset('storage/' . $upload->file_path), // yoki Storage::url()
                        ];
                    }
                }
            }
        }

        $item->results = $userAnswer;
    }
    return $item;
});
```
