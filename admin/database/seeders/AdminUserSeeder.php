<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin_cinema@gmail.com'],
            [
                'name' => 'Cinema Admin',
                'password' => Hash::make('cinema@2026'),
            ]
        );
    }
}