
            // Mobile menu functionality
            const menuBtn = document.getElementById('menuBtn');
            const closeBtn = document.getElementById('closeBtn');
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('overlay');

            function openSidebar() {
                sidebar.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }

            function closeSidebar() {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }

            menuBtn.addEventListener('click', openSidebar);
            closeBtn.addEventListener('click', closeSidebar);
            overlay.addEventListener('click', closeSidebar);

            // Handle navigation clicks
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');

                    if (window.innerWidth < 1024) {
                        closeSidebar();
                    }
                });
            });

            // Close sidebar on window resize
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 1024) {
                    closeSidebar();
                }
            });

            // Handle escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && sidebar.classList.contains('active')) {
                    closeSidebar();
                }
            });

            // Counter functionality
            const counterBtns = document.querySelectorAll('.counter-btn');
            counterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const label = btn.getAttribute('aria-label');
                    console.log(`${label} clicked`);
                });
            });
       