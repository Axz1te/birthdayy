(function () {
    const existing = document.getElementById('petal-layer');
    if (existing) {
        existing.remove();
    }

    const layer = document.createElement('div');
    layer.id = 'petal-layer';
    layer.className = 'petal-container';
    layer.setAttribute('aria-hidden', 'true');

    const petalCount = 44;
    for (let i = 0; i < petalCount; i += 1) {
        const petal = document.createElement('span');
        petal.className = 'petal';

        const size = 8 + Math.random() * 10;
        const left = Math.random() * 100;
        const duration = 10 + Math.random() * 10;
        const delay = Math.random() * 5;
        const drift = (Math.random() * 180) - 90;
        const rotation = 360 + Math.random() * 720;
        const opacity = 0.7 + Math.random() * 0.3;

        petal.style.width = `${size}px`;
        petal.style.height = `${size * 0.84}px`;
        petal.style.left = `${left}%`;
        petal.style.setProperty('--duration', `${duration}s`);
        petal.style.setProperty('--delay', `${delay}s`);
        petal.style.setProperty('--drift', `${drift}px`);
        petal.style.setProperty('--rotation', `${rotation}deg`);
        petal.style.setProperty('--opacity', `${opacity}`);
        layer.appendChild(petal);
    }

    document.body.appendChild(layer);
})();
