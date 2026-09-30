<?php

namespace App\Http\Controllers;

use App\Models\DemoRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DemoRequestController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'company' => ['required', 'string', 'max:160'],
            'team_size' => ['required', Rule::in(['1-5', '6-20', '21-50', '51+'])],
            'message' => ['nullable', 'string', 'max:2000'],
            'website' => ['nullable', 'max:0'],
        ]);
        unset($data['website']);
        DemoRequest::create($data);

        return to_route('home');
    }
}
