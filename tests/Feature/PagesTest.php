<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PagesTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Http::fake([
            'api.github-star-counter.workers.dev/*' => Http::response(['stars' => 1234]),
            'api.github.com/users/*' => Http::response(['public_repos' => 42, 'followers' => 7]),
        ]);
    }

    public function test_home_page_renders_with_shared_layout_data(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('home')
                ->where('name', config('app.name'))
                ->where('locale.current', 'en')
                ->has('locale.options', 4)
                ->has('navigation', 2)
                ->where('navigation.0.active', true)
                ->where('navigation.1.active', false)
                ->has('socials', 6)
                ->has('stats', 4)
                ->where('stats.0.label', 'GitHub Stars')
                ->where('stats.0.value', 1234)
                ->where('stats.1.value', 42)
                ->where('stats.3.value', 7)
                ->has('links', 5)
                ->where('notice', null)
            );
    }

    public function test_home_page_shows_notice_for_dutch_visitors(): void
    {
        $this->withSession(['app_locale' => 'nl'])
            ->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('home')
                ->where('locale.current', 'nl')
                ->where('notice.title', 'Woops!')
            );
    }

    public function test_about_page_renders_sections_and_gallery(): void
    {
        $this->get('/hakkimda')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('about')
                ->where('name', config('app.name'))
                ->where('fullName', 'Yavuz Selimhan Kaya')
                ->where('navigation.1.active', true)
                ->has('sections', 5)
                ->where('sections.0.title', 'About Me')
                ->has('gallery.photos', 7)
            );
    }

    public function test_document_page_proxies_allowed_paths(): void
    {
        $this->get('/documents?path=cidqu.net/cv.pdf&title=CV')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('document')
                ->where('title', 'CV')
                ->where('source', 'https://nocors.api.cidqu.net/cidqu.net/cv.pdf')
                ->where('back.href', route('home'))
            );
    }

    public function test_document_page_keeps_same_site_back_link(): void
    {
        $this->from(route('about'))
            ->get('/documents?path=cidqu.net/cv.pdf')
            ->assertInertia(fn (Assert $page) => $page->where('back.href', route('about')));
    }

    public function test_document_page_ignores_foreign_back_link(): void
    {
        $this->withHeader('referer', 'https://example.com/elsewhere')
            ->get('/documents?path=cidqu.net/cv.pdf')
            ->assertInertia(fn (Assert $page) => $page->where('back.href', route('home')));
    }

    public function test_document_page_rejects_other_hosts(): void
    {
        $this->get('/documents?path=example.com/file.pdf')->assertNotFound();
    }

    public function test_locale_can_be_switched(): void
    {
        $this->from('/')
            ->post('/locale', ['locale' => 'tr'])
            ->assertRedirect('/')
            ->assertSessionHas('app_locale', 'tr');

        $this->get('/')
            ->assertInertia(fn (Assert $page) => $page
                ->where('locale.current', 'tr')
                ->where('navigation.1.label', 'Hakkımda')
            );
    }
}
