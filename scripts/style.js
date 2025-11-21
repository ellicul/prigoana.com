const title = document.getElementById('glitchText');
const chars = "ABCDEFGHIJKLMNOPQRSTUVXYZ[]#%&_<>*+";

const glitchEffect = (target) => {
    const originalText = target.dataset.text || target.innerText;
    let iterations = 0;
    const interval = setInterval(() => {
        target.innerText = originalText.split("")
            .map((letter, index) => {
                if(index < iterations) return originalText[index];
                return chars[Math.floor(Math.random() * chars.length)]
            })
            .join("");

        if(iterations >= originalText.length) clearInterval(interval);
        iterations += 1/3;
    }, 30);
};

if(title) {
    title.addEventListener('mouseover', () => glitchEffect(title));
    setTimeout(() => glitchEffect(title), 500);
}

const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    observer.observe(el);
});

document.querySelectorAll('.highlightable').forEach(codeBlock => {
    codeBlock.addEventListener('click', function() {
        let textToCopy;

        if (this.dataset.copy) {
            textToCopy = this.dataset.copy;
        } else {
            const clone = this.cloneNode(true);
            const feedback = clone.querySelector('.copy-feedback');
            if (feedback) feedback.remove();
            textToCopy = clone.innerText.trim();
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            this.classList.add('copied');
            setTimeout(() => this.classList.remove('copied'), 1500);
        });
    });
});

function toggleCrypto(header) {
    const content = header.nextElementSibling;
    const toggle = header.querySelector('.crypto-toggle');

    content.classList.toggle('active');
    toggle.textContent = content.classList.contains('active') ? '[-]' : '[+]';
}

function copyAddress(btn, address) {
    navigator.clipboard.writeText(address).then(() => {
        const originalText = btn.textContent;
        btn.textContent = 'COPIED!';
        btn.style.background = 'var(--accent)';
        btn.style.color = '#000';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.color = '';
        }, 1500);
    });
}

function showQR(btn, address) {
    const qrContainer = btn.closest('.crypto-content').querySelector('.qr-container');

    if (qrContainer.classList.contains('active')) {
        qrContainer.classList.remove('active');
        qrContainer.innerHTML = '';
        btn.textContent = 'QR CODE';
    } else {
        qrContainer.innerHTML = '';
        qrContainer.classList.add('active');
        new QRCode(qrContainer, {
            text: address,
            width: 200,
            height: 200,
            colorDark: "#ffffff",
            colorLight: "#000000",
        });
        btn.textContent = 'HIDE QR';
    }
}
