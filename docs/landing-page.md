# SOMFIX public landing page

The public route `/` renders `resources/js/pages/welcome.tsx`. Reusable sections and the demo dialog live in `resources/js/components/landing`. Styles in `resources/css/landing.css` are scoped to the landing page; theme switching uses the existing appearance hook.

The Overview and Work orders tabs switch the illustrative dashboard dataset. All figures and names are sample data, not customer claims. Mobile navigation uses the existing Radix-backed Sheet. Reduced-motion preferences disable reveal animations.

## Inquiries

Demo and contact buttons open a validated inquiry form. `POST /demo-requests` stores requests in `demo_requests`; it does not send email or create accounts. Apply the included migration with `php artisan migrate`. Submissions are rate limited to five per minute and include a honeypot. The form reports success only after a successful server response. Email delivery and a staff inbox are not configured; requests can be retrieved through the DemoRequest model. Contact Us uses the inquiry form until a company contact address is supplied.

Footer privacy and service information describe this preview and inquiry handling. They are not a substitute for company-approved service terms. Social icons are explicitly disabled placeholders until real profile URLs are available.

## Photography

Photos are downloaded to `public/images/landing` so the page does not depend on remote image requests. Source photos (Pexels):

- `property.jpg`: [Modern apartment building with balconies](https://www.pexels.com/photo/modern-apartment-building-with-balconies-31458376/)
- `team.jpg`: [Two engineers reviewing a building — Mikael Blomkvist](https://www.pexels.com/photo/a-two-engineer-talking-together-8961073/)
- `technician.jpg`: [Technician working in an apartment — Antoni Shkraba](https://www.pexels.com/photo/man-drilling-in-a-wall-in-an-apartment-4981802/)
- `inventory.jpg`: [Warehouse team member — Tiger Lily](https://www.pexels.com/photo/man-standing-in-an-aisle-of-a-warehouse-carrying-a-box-4483774/)
- `service.jpg`: [Technician inspecting an air conditioner](https://www.pexels.com/photo/technician-fixing-an-aircon-5463582/)

Photography is illustrative and does not depict SOMFIX customers or staff. See the [Pexels license](https://www.pexels.com/license/).
