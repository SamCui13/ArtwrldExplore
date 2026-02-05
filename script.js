var links = document.querySelectorAll('a[href^="#"]');

for (var i = 0; i < links.length; i++) {
    links[i].onclick = function(e) {
        e.preventDefault();
        var targetId = this.getAttribute('href');
        var targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };
}

var form = document.querySelector('.contact-form');

if (form) {
    form.onsubmit = function(e) {
        e.preventDefault();
        alert('Thanks for reaching out! I will get back to you soon.');
    };
}