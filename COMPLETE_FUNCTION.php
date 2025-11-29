<?php

namespace App\Http\Controllers;

use App\Models\TestResult;
use App\Models\Upload;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TestResultController extends Controller
{
    /**
     * Foydalanuvchi test natijalarini olish
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getUserTestResults(Request $request): JsonResponse
    {
        // Validation
        $request->validate([
            'user_id' => 'required|integer',
        ]);

        // Query builder
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
                    return $item;
                }
                
                // questions_36_45.images ichidagi upload_id larni URL ga o'zgartirish
                if (isset($userAnswer['questions_36_45']['images']) && 
                    isset($userAnswer['questions_36_45']['mode']) &&
                    $userAnswer['questions_36_45']['mode'] === 'image') {
                    
                    foreach ($userAnswer['questions_36_45']['images'] as $qNum => $imageData) {
                        if (isset($imageData['upload_id'])) {
                            $upload = Upload::find($imageData['upload_id']);
                            if ($upload) {
                                // Rasm URL ni olish
                                // Sizning loyihangizga mos ravishda o'zgartiring
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
            }
            return $item;
        });

        return response()->json([
            'status' => true,
            'message' => "Qatnashgan testlar ro'yhati.",
            'results' => $paginatedResults,
        ]);
    }
}

