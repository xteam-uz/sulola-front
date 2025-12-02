# Backend O'zgarishlar

## 1. TestController - `checkStudentAnswers` Metodini Yangilash

O'qituvchi balllarini saqlash uchun `checkStudentAnswers` metodini yangilang:

```php
/**
 * O'quvchi test javoblarini tekshirish (36-45 savollar uchun ball qo'yish)
 */
public function checkStudentAnswers(Request $request, $id, $studentId)
{
    try {
        // Validation
        $request->validate([
            'scores' => 'required|array',
            'scores.*' => 'numeric|min:0', // Har bir savol uchun ball 0 yoki musbat bo'lishi kerak
        ]);

        // Test va o'quvchi tekshiruvi
        $test = Test::findOrFail($id);
        $student = User::findOrFail($studentId);

        // TestResult ni topish
        $testResult = TestResult::where('test_id', $id)
            ->where('user_id', $studentId)
            ->firstOrFail();

        // Olingan scores ni olish (36-45 savollar uchun balllar)
        $scores = $request->scores; // Format: { "36": 25, "37": 30, ... }

        // all_result ni olish (agar mavjud bo'lsa) yoki yangi array yaratish
        $allResult = $testResult->all_result ?? [];

        // teacher_scores ni all_result ichiga saqlash
        // String kalitlar bilan saqlaymiz (JSON format uchun)
        $teacherScores = [];
        foreach ($scores as $questionNum => $score) {
            $teacherScores[(string)$questionNum] = (float)$score;
        }

        // all_result ni yangilash - teacher_scores qo'shish
        $allResult['teacher_scores'] = $teacherScores;

        // TestResult ni yangilash
        $testResult->update([
            'all_result' => $allResult,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tekshirish yakunlandi',
            'all_result' => $testResult->all_result,
        ]);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Test yoki o\'quvchi topilmadi',
        ], 404);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Xatolik yuz berdi: ' . $e->getMessage(),
        ], 500);
    }
}
```

## 2. TestController - `getStudentAnswers` Metodini Yangilash

O'quvchi javoblarini olish metodida `all_result` ni ham qaytaring:

```php
/**
 * O'quvchi test javoblarini olish
 */
public function getStudentAnswers($id, $studentId)
{
    try {
        // Test va o'quvchi tekshiruvi
        $test = Test::findOrFail($id);
        $student = User::findOrFail($studentId);

        // TestResult ni topish
        $testResult = TestResult::where('test_id', $id)
            ->where('user_id', $studentId)
            ->firstOrFail();

        // O'quvchi javoblarini parse qilish
        $userAnswer = $testResult->user_answer ?? [];

        // all_result ni olish (teacher_scores shu yerda bo'ladi)
        $allResult = $testResult->all_result ?? [];

        // Tekshirilganlik holatini aniqlash
        // Agar all_result ichida teacher_scores bo'lsa, test tekshirilgan
        $checked = false;
        if (isset($allResult['teacher_scores']) &&
            is_array($allResult['teacher_scores']) &&
            count($allResult['teacher_scores']) > 0) {
            $checked = true;
        }

        return response()->json([
            'success' => true,
            'student' => [
                'id' => $student->id,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
            ],
            'answers' => $userAnswer,
            'all_result' => $allResult, // teacher_scores shu yerda
            'checked' => $checked,
        ]);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Test yoki o\'quvchi topilmadi',
        ], 404);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Xatolik yuz berdi: ' . $e->getMessage(),
        ], 500);
    }
}
```

## 3. Routes.php da Route

Route allaqachon mavjud bo'lishi kerak, lekin tekshirib ko'ring:

```php
// tests.php yoki api.php ichida
Route::get('/tests/{id}/students/{studentId}/answers', [TestController::class, 'getStudentAnswers'])
    ->name('api.tests.student.answers');

Route::post('/tests/{id}/students/{studentId}/check', [TestController::class, 'checkStudentAnswers'])
    ->name('api.tests.student.check');
```

## 4. all_result JSON Strukturasi

`all_result` JSON uchun format:

```json
{
  "teacher_scores": {
    "36": 25,
    "37": 30,
    "38": 28,
    "39": 30,
    "40": 25,
    "41": 30,
    "42": 35,
    "43": 10,
    "44": 10,
    "45": 10
  }
}
```

**Muhim:**

- Kalitlar STRING formatida bo'lishi kerak (`"36"`, `"37"`, ...)
- Ballar NUMBER yoki FLOAT formatida bo'lishi kerak

## 5. Migration (Agar all_result ustuni yo'q bo'lsa)

Agar `test_results` jadvalida `all_result` ustuni yo'q bo'lsa, migration yaratish kerak:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('test_results', function (Blueprint $table) {
            if (!Schema::hasColumn('test_results', 'all_result')) {
                $table->json('all_result')->nullable()->after('user_answer');
            }
        });
    }

    public function down(): void
    {
        Schema::table('test_results', function (Blueprint $table) {
            if (Schema::hasColumn('test_results', 'all_result')) {
                $table->dropColumn('all_result');
            }
        });
    }
};
```

## 6. TestResult Model (Allaqachon tayyor)

Model allaqachon to'g'ri sozlangan:

```php
protected $casts = [
    'all_result'  => 'array', // JSON ni avtomatik array ga o'giradi
    'user_answer' => 'array',
];
```

## 7. Qo'shimcha Tekshiruvlar

`checkStudentAnswers` metodida quyidagilarni tekshiring:

- O'qituvchi testni tekshirish huquqiga ega ekanligini
- Barcha 36-45 savollar uchun balllar berilganligini
- Ballar to'g'ri formatda ekanligini (0-100 orasida)

## 8. Xatoliklarni Boshqarish

Xatoliklar uchun:

```php
// Agar all_result saqlashda muammo bo'lsa
try {
    $testResult->update([
        'all_result' => $allResult,
    ]);
} catch (\Exception $e) {
    \Log::error('all_result saqlashda xatolik: ' . $e->getMessage());
    return response()->json([
        'success' => false,
        'message' => 'Ballarni saqlashda xatolik yuz berdi',
    ], 500);
}
```

## Xulosa

Asosiy o'zgarishlar:

1. ✅ `checkStudentAnswers` - `all_result.teacher_scores` ga saqlash
2. ✅ `getStudentAnswers` - `all_result` ni qaytarish
3. ✅ JSON formatida String kalitlar bilan saqlash
4. ✅ Model allaqachon `all_result` ni array ga cast qiladi
