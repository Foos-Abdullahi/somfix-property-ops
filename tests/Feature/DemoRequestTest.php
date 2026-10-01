<?php

use Inertia\Testing\AssertableInertia as Assert;

it('serves the public landing page', function () {
    $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page->component('welcome'));
});

it('stores a valid demo inquiry without creating a user account', function () {
    $data = ['name' => 'Demo Visitor', 'email' => 'visitor@example.com', 'company' => 'Example Property Team', 'team_size' => '6-20', 'message' => 'We would like to connect our maintenance teams.', 'website' => ''];
    $this->post('/demo-requests', $data)->assertSessionHasNoErrors()->assertRedirect('/');
    $this->assertDatabaseHas('demo_requests', ['email' => $data['email'], 'company' => $data['company']]);
    $this->assertDatabaseMissing('users', ['email' => $data['email']]);
});

it('validates inquiry details and rejects the honeypot', function () {
    $this->post('/demo-requests', ['email' => 'invalid', 'team_size' => 'anything'])->assertSessionHasErrors(['name', 'email', 'company', 'team_size']);
    $this->post('/demo-requests', ['name' => 'Visitor', 'email' => 'visitor@example.com', 'company' => 'Company', 'team_size' => '1-5', 'website' => 'spam'])->assertSessionHasErrors('website');
    $this->assertDatabaseCount('demo_requests', 0);
});

it('rate limits public inquiry submissions', function () {
    for ($i = 0; $i < 5; $i++) {
        $this->post('/demo-requests', [])->assertSessionHasErrors();
    }
    $this->post('/demo-requests', [])->assertStatus(429);
});
