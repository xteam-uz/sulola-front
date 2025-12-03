# Backend Price Field Muammosi va Yechimi

## Muammo

Frontenddan `price` maydoni yuborilmoqda, lekin backend kodida:
1. ❌ `price` validatsiyada yo'q
2. ❌ `price` Test::create() metodida saqlanmayapti
3. ⚠️ Bu kelajakda pulli va tekin testlarni ajratishda muammo tug'dirishi mumkin

## Frontend O'zgarishlari (✅ Bajarildi)

### FreeTests.jsx
- ✅ `price` validation olib tashlandi
- ✅ `price` input maydoni olib tashlandi  
- ✅ Backendga yuborilganda `price: 0` yuboriladi
- ✅ `price` state olib tashlandi

### PaidTests.jsx
- ✅ `price` validation va input maydoni mavjud (to'g'ri ishlaydi)

## Backend Tavsiyalar

Backend kodida quyidagi o'zgarishlarni qilish kerak:

### 1. Database Migration

Agar `tests` jadvalida `price` maydoni yo'q bo'lsa, migration yaratish:

```php
php artisan make:migration add_price_to_tests_table

// Migration fayli:
Schema::table('tests', function (Blueprint $table) {
    $table->decimal('price', 10, 2)->default(0)->after('type');
});
```

### 2. Test Model

`Test` modelida `price` maydonini `$fillable` ga qo'shish:

```php
protected $fillable = [
    'user_id',
    'name',
    'science_id',
    'code',
    'type',
    'price', // Qo'shish kerak
    'start_time',
    'end_time',
    'description',
    'details',
];
```

### 3. Controller Validation

`store` metodida `price` validatsiyasini qo'shish:

```php
$request->validate([
    'name' => 'required|string|max:255',
    'science_id' => 'required|exists:science,id',
    'type' => 'required|integer|in:' . implode(',', TestTypeEnum::LIST),
    'price' => 'required|numeric|min:0', // Qo'shish kerak
    'start_time' => 'required|date',
    'end_time' => 'required|date|after:start_time',
    'details' => 'nullable|array',
]);
```

### 4. Test Create

`Test::create()` metodida `price` ni qo'shish:

```php
$test = Test::create([
    'user_id' => Auth::user() ? Auth::user()->id : null,
    'name' => $request->name,
    'science_id' => $request->science_id,
    'code' => $code,
    'type' => $request->type,
    'price' => $request->price ?? 0, // Qo'shish kerak (default 0)
    'start_time' => Carbon::parse($request->start_time),
    'end_time' => Carbon::parse($request->end_time),
    'description' => $request->description,
    'details' => $request->details ?? [],
]);
```

### 5. Update Metodida ham

Agar `update` metodi bo'lsa, u yerda ham `price` ni qo'shish:

```php
$test->update([
    // ... boshqa maydonlar
    'price' => $request->price ?? $test->price,
]);
```

## To'liq Store Metod Namuna

```php
public function store(Request $request)
{
    try {
        // Details ni JSON dan array ga o'girish
        if ($request->has('details') && is_string($request->details)) {
            $request->merge([
                'details' => json_decode($request->details, true),
            ]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'science_id' => 'required|exists:science,id',
            'type' => 'required|integer|in:' . implode(',', TestTypeEnum::LIST),
            'price' => 'required|numeric|min:0', // ✅ Qo'shildi
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'details' => 'nullable|array',
        ]);

        $code = $this->generateUniqueCode();

        $test = Test::create([
            'user_id' => Auth::user() ? Auth::user()->id : null,
            'name' => $request->name,
            'science_id' => $request->science_id,
            'code' => $code,
            'type' => $request->type,
            'price' => $request->price ?? 0, // ✅ Qo'shildi
            'start_time' => Carbon::parse($request->start_time),
            'end_time' => Carbon::parse($request->end_time),
            'description' => $request->description,
            'details' => $request->details ?? [],
        ]);

        return response()->json([
            'success' => true,
            'message' => "Test muvaffaqiyatli qo'shildi",
            'test' => $test,
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Validatsiya xatosi',
            'errors' => $e->errors(),
        ], 422);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => "Test qo'shishda xatolik: " . $e->getMessage(),
        ], 500);
    }
}
```

## Natija

Bu o'zgarishlar bilan:
- ✅ Tekin testlar `price: 0` bilan saqlanadi
- ✅ Pulli testlar to'g'ri `price` bilan saqlanadi
- ✅ Kelajakda pulli/tekin testlarni ajratish oson bo'ladi
- ✅ Payment logikasi to'g'ri ishlaydi

## Qo'shimcha Eslatmalar

1. **Agar bazada allaqachon testlar bo'lsa**: Migration yaratishdan oldin mavjud testlar uchun `price = 0` qilib update qilish kerak bo'lishi mumkin.

2. **Payment logic**: Kelajakda payment qismida `$test->price > 0` shartini tekshirish orqali pulli/tekin testlarni ajratish mumkin.

3. **API Response**: Test ma'lumotlarini qaytarishda `price` ham qaytarsa yaxshi bo'ladi, frontend tomonida pulli/tekin testlarni ko'rsatish uchun.

