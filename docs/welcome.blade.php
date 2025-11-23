<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BEQEEK - Phần Mềm SaaS Tùy Chỉnh Hiện Đại</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f0f4f8;
            color: #333;
            line-height: 1.6;
            overflow-x: hidden;
        }
        header {
            position: sticky;
            top: 0;
            background: linear-gradient(135deg, #375086, #2563eb);
            color: white;
            padding: 20px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            z-index: 1000;
        }
        header h1 {
            font-size: 2rem;
            margin: 0;
        }
        nav ul {
            list-style: none;
            display: flex;
            margin: 0;
            padding: 0;
        }
        nav ul li {
            margin-left: 30px;
        }
        nav ul li a {
            color: white;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.3s;
        }
        nav ul li a:hover {
            color: #ffeb3b;
        }
        .hero {
            position: relative;
            height: 90vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            background: linear-gradient(rgba(0, 4, 255, 0.5), rgba(0, 0, 0, 0.5)), url('https://via.placeholder.com/1920x1080?text=Hero+Background');
            background-size: cover;
            color: white;
            padding: 0 20px;
        }
        .hero h1 {
            font-size: 4rem;
            margin-bottom: 20px;
            animation: fadeInDown 1s ease-out;
        }
        .hero p {
            font-size: 1.8rem;
            margin-bottom: 40px;
            max-width: 800px;
            animation: fadeInUp 1s ease-out 0.5s;
            animation-fill-mode: backwards;
        }
        .cta-button {
            background: linear-gradient(135deg, #375086, #2563eb);
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            font-size: 1.2rem;
            border-radius: 50px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            animation: fadeIn 1s ease-out 1s;
            animation-fill-mode: backwards;
            margin: 10px;
            cursor: pointer;
        }
        .cta-button:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 15px rgba(0, 123, 255, 0.4);
        }
        .features, .benefits, .testimonials, .pricing {
            padding: 80px 20px;
            background-color: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .features h2, .benefits h2, .testimonials h2, .pricing h2 {
            text-align: center;
            font-size: 3rem;
            margin-bottom: 60px;
            color: #375086;
            position: relative;
        }
        .features h2::after, .benefits h2::after, .testimonials h2::after, .pricing h2::after {
            content: '';
            width: 100px;
            height: 4px;
            background: #375086;
            display: block;
            margin: 20px auto 0;
            border-radius: 2px;
        }
        .feature-grid, .benefit-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 40px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .feature, .benefit {
            background-color: #f9f9f9;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .feature:hover, .benefit:hover {
            transform: translateY(-10px);
            box-shadow: 0 12px 25px rgba(0,0,0,0.15);
        }
        .feature i, .benefit i {
            font-size: 3rem;
            color: #375086;
            margin-bottom: 20px;
            transition: color 0.3s ease;
        }
        .feature:hover i, .benefit:hover i {
            color: #2563eb;
        }
        .feature h3, .benefit h3 {
            font-size: 1.8rem;
            margin-bottom: 15px;
            color: #375086;
        }
        .feature p, .benefit p {
            font-size: 1.1rem;
        }
        .testimonials .testimonial-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 40px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .testimonial {
            background-color: #f9f9f9;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            position: relative;
        }
        .testimonial::before {
            content: '"';
            font-size: 6rem;
            color: #375086;
            position: absolute;
            top: -20px;
            left: 20px;
            opacity: 0.2;
        }
        .testimonial p {
            font-style: italic;
            margin-bottom: 20px;
        }
        .testimonial .author {
            font-weight: bold;
            color: #375086;
        }
        .pricing .pricing-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 40px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .price-plan {
            background-color: #f9f9f9;
            padding: 50px 30px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            transition: transform 0.3s ease;
        }
        .price-plan:hover {
            transform: translateY(-10px);
            box-shadow: 0 12px 25px rgba(0,0,0,0.15);
        }
        .price-plan h3 {
            font-size: 2rem;
            color: #375086;
            margin-bottom: 20px;
        }
        .price-plan .price {
            font-size: 3rem;
            margin-bottom: 30px;
            color: #333;
        }
        .price-plan ul {
            list-style: none;
            padding: 0;
            margin-bottom: 40px;
        }
        .price-plan ul li {
            margin-bottom: 15px;
            font-size: 1.1rem;
        }
        .price-plan ul li i {
            color: #28a745;
            margin-right: 10px;
        }
        .free-plan {
            border: 3px solid #28a745;
        }
        footer {
            background-color: #333;
            color: white;
            text-align: center;
            padding: 40px 20px;
            margin-top: 80px;
        }
        footer p {
            margin: 10px 0;
        }
        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.4);
            /*padding-top: 60px;*/
        }
        .modal-content {
            background-color: #fefefe;
            margin: 1% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 600px;
            border-radius: 10px;
            text-align: center;
        }
        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
        }
        .close:hover,
        .close:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }
        /* Placeholder for iframe */
        #iframe-placeholder {
            width: 100%;
            height: 500px;
            border: none;
        }
        @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-50px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @media (max-width: 768px) {
            .hero h1 {
                font-size: 3rem;
            }
            .hero p {
                font-size: 1.5rem;
            }
            .features h2, .benefits h2, .testimonials h2, .pricing h2 {
                font-size: 2.5rem;
            }
        }
        @media (max-width: 768px) {
            .hide-mobile {
                display: none !important;
            }

            h1 {
                font-size: 2.3rem !important;
            }
        }
    </style>
</head>
<body>

<header>
    <h1>BEQEEK</h1>
    <nav>
        <ul>
            <li><a href="#features">Đặc Điểm</a></li>
            <li><a href="#benefits">Lợi Ích</a></li>
            <li><a href="#pricing">Giá</a></li>
            <li class="hide-mobile"><a href="#signup" onclick="openModal()" class="cta-button" style="padding: 10px 20px; border-radius: 30px;">Đăng Ký</a></li>
        </ul>
    </nav>
</header>

<section class="hero">
    <h1>Vận Hành Quy Trình Kinh Doanh, Tự Động Hoá Mượt Mà Với BEQEEK</h1>
    <p>Sản phẩm phần mềm tùy chỉnh, tự thiết lập theo nhu cầu, bảo mật cao và quản lý hàng trăm nghiệp vụ doanh nghiệp một cách dễ dàng.</p>
    <a onclick="openModal()" class="cta-button">Đăng ký dùng thử miễn phí</a>
{{--    <a href="#login" class="cta-button" style="background: linear-gradient(135deg, #28a745, #5cb85c);">Truy Cập Hệ Thống (Nếu Đã Có Tài Khoản)</a>--}}
</section>

<section class="features" id="features">
    <h2>Đặc Điểm Nổi Bật</h2>
    <div class="feature-grid">
        <div class="feature">
            <i class="fas fa-tools"></i>
            <h3>Tùy Chỉnh Tự Thiết Lập</h3>
            <p>Thiết kế và cấu hình phần mềm theo nhu cầu cụ thể của doanh nghiệp bạn mà không cần lập trình viên chuyên nghiệp.</p>
        </div>
        <div class="feature">
            <i class="fas fa-lock"></i>
            <h3>Bảo Mật Mã Hóa Đầu Cuối</h3>
            <p>Dữ liệu của bạn được bảo vệ tối đa với công nghệ mã hóa end-to-end, đảm bảo an toàn và riêng tư.</p>
        </div>
        <div class="feature">
            <i class="fas fa-plug"></i>
            <h3>Kết Nối API Mở</h3>
            <p>BEQEEK có thể kết nối đến các đối tác và hệ thống phần mềm khác thông qua API mở, giúp tích hợp mượt mà và mở rộng hệ sinh thái.</p>
        </div>
    </div>
</section>

<section class="benefits" id="benefits">
    <h2>Lợi Ích Khi Sử Dụng BEQEEK</h2>
    <div class="benefit-grid">
        <div class="benefit">
            <i class="fas fa-chart-line"></i>
            <h3>Tăng Hiệu Quả Kinh Doanh</h3>
            <p>Tối ưu hóa quy trình làm việc, giảm thời gian xử lý và tăng năng suất cho đội ngũ của bạn.</p>
        </div>
        <div class="benefit">
            <i class="fas fa-piggy-bank"></i>
            <h3>Tiết Kiệm Chi Phí</h3>
            <p>Không cần đầu tư vào phần mềm tùy chỉnh đắt đỏ, BEQEEK mang đến giải pháp linh hoạt với chi phí hợp lý.</p>
        </div>
{{--        <div class="benefit">--}}
{{--            <i class="fas fa-arrows-alt"></i>--}}
{{--            <h3>Dễ Dàng Mở Rộng</h3>--}}
{{--            <p>Phần mềm phát triển cùng doanh nghiệp, dễ dàng thêm tính năng mới khi nhu cầu thay đổi.</p>--}}
{{--        </div>--}}
{{--        <div class="benefit">--}}
{{--            <i class="fas fa-mobile-alt"></i>--}}
{{--            <h3>Hỗ Trợ Đa Nền Tảng</h3>--}}
{{--            <p>Truy cập và quản lý từ mọi thiết bị, bao gồm mobile, desktop và web, đảm bảo linh hoạt làm việc mọi lúc mọi nơi.</p>--}}
{{--        </div>--}}
{{--        <div class="benefit">--}}
{{--            <i class="fas fa-brain"></i>--}}
{{--            <h3>Phân Tích Dữ Liệu Thông Minh</h3>--}}
{{--            <p>Tích hợp công cụ phân tích dữ liệu tự động, giúp đưa ra quyết định dựa trên insights thời gian thực.</p>--}}
{{--        </div>--}}
        <div class="benefit">
            <i class="fas fa-sitemap"></i>
            <h3>Quản Lý Hàng Trăm Nghiệp Vụ</h3>
            <p>Tự tạo ra các ứng dụng cho hàng trăm quy trình kinh doanh khác nhau, từ bán hàng đến nhân sự và hơn thế nữa.</p>
        </div>
    </div>
</section>

<section class="testimonials" id="testimonials">
    <h2>Khách Hàng Nói Gì Về BEQEEK</h2>
    <div class="testimonial-grid">
        <div class="testimonial">
            <p>"BEQEEK đã thay đổi cách chúng tôi quản lý doanh nghiệp. Tùy chỉnh dễ dàng và bảo mật tuyệt vời!"</p>
            <span class="author">- Trần Lan</span>
        </div>
{{--        <div class="testimonial">--}}
{{--            <p>"Một công cụ mạnh mẽ giúp chúng tôi xử lý hàng trăm nghiệp vụ mà không gặp khó khăn."</p>--}}
{{--            <span class="author">- Nguyễn Văn Đạt</span>--}}
{{--        </div>--}}
        <div class="testimonial">
            <p>"Bảo mật end-to-end mang lại sự yên tâm cho dữ liệu nhạy cảm của chúng tôi."</p>
            <span class="author">- Lê Minh Quân</span>
        </div>
        <div class="testimonial">
            <p>"Tích hợp API mở đã giúp chúng tôi kết nối nhanh chóng với các hệ thống khác, tiết kiệm hàng tháng phát triển."</p>
            <span class="author">- Phạm Thị Dung</span>
        </div>
{{--        <div class="testimonial">--}}
{{--            <p>"Phân tích dữ liệu thông minh từ BEQEEK giúp chúng tôi tăng doanh số 30% chỉ trong quý đầu."</p>--}}
{{--            <span class="author">- Hoàng Văn Thái</span>--}}
{{--        </div>--}}
{{--        <div class="testimonial">--}}
{{--            <p>"Hỗ trợ đa nền tảng của BEQEEK giúp đội ngũ chúng tôi làm việc hiệu quả từ mọi nơi."</p>--}}
{{--            <span class="author">- Đỗ Thị Vân</span>--}}
{{--        </div>--}}
    </div>
</section>

<section class="pricing" id="pricing">
    <h2>Bảng Giá</h2>
    <div class="pricing-grid">
        <div class="price-plan free-plan">
            <h3>Miễn Phí</h3>
            <div class="price">0 VNĐ/tháng</div>
            <ul>
                <li><i class="fas fa-check"></i>Thử nghiệm 7 ngày</li>
                <li><i class="fas fa-check"></i>Tùy chỉnh cơ bản</li>
                <li><i class="fas fa-check"></i>Bảo mật end-to-end</li>
                <li><i class="fas fa-check"></i>Quản lý 10 nghiệp vụ</li>
            </ul>
            <a onclick="openModal()" class="cta-button">Thử Ngay</a>
        </div>
        <div class="price-plan">
            <h3>Cơ Bản</h3>
            <div class="price">630.000 VNĐ/tháng</div>
            <ul>
                <li><i class="fas fa-check"></i>Tùy chỉnh cơ bản</li>
                <li><i class="fas fa-check"></i>Bảo mật end-to-end</li>
                <li><i class="fas fa-check"></i>Quản lý 50 nghiệp vụ</li>
                <li><i class="fas fa-check"></i>10 người dùng (33.000 VNĐ/tháng)</li>
                <li><i class="fas fa-check"></i>1 wCPU luồng tự động hoá (300.000 VNĐ/tháng)</li>
            </ul>
            <a onclick="openModal()" class="cta-button">Chọn Gói</a>
        </div>
        <div class="price-plan">
            <h3>Nâng cao</h3>
            <div class="price">Liên Hệ</div>
            <ul>
                <li><i class="fas fa-check"></i>Tùy chỉnh nâng cao</li>
                <li><i class="fas fa-check"></i>Bảo mật end-to-end</li>
                <li><i class="fas fa-check"></i>Quản lý toàn diện</li>
                <li><i class="fas fa-check"></i>10 người dùng (33.000 VNĐ/tháng)</li>
                <li><i class="fas fa-check"></i>1 wCPU luồng tự động hoá (300.000 VNĐ/tháng)</li>

            </ul>
            <a onclick="openModal()" class="cta-button">Liên Hệ</a>
        </div>
    </div>
</section>

<!-- Modal Popup -->
<div id="signupModal" class="modal">
    <div class="modal-content">
        <span class="close" onclick="closeModal()">&times;</span>
        <h2>Đăng Ký / Chọn Gói</h2>
        <!-- Placeholder for iframe -->
        <iframe id="iframe-placeholder" src="https://app.o1erp.com/platform/forms/732878538910205325/019952f6-f3f5-57-7a-a6c362a6933141a3"></iframe>
    </div>
</div>

<footer>
    <p>&copy; 2025 BEQEEK. Tất cả quyền được bảo lưu.</p>
    <p>Liên hệ: support@beqeek.com</p>
</footer>

<script>
    function openModal() {
        document.getElementById('signupModal').style.display = 'block';

        fetch('https://app.o1erp.com/api/workspace/732878538910205325/webhook/post/workflows/01995753-6941-93-70-be12f8844a6a01a1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ event: 'open_signup_modal', client: navigator.userAgent, timestamp: new Date().toISOString() })
        });
    }
    function closeModal() {
        document.getElementById('signupModal').style.display = 'none';
    }
    window.onclick = function(event) {
        if (event.target == document.getElementById('signupModal')) {
            closeModal();
        }
    }
</script>
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "tc90lf31v5");
</script>

</body>
</html>
