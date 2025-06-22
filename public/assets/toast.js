let toastCounter = 0;
let activeToastId = null;
let toastTimer = null;

function showToast(type = 'info', message, duration = 5000) {
    if (activeToastId) {
        closeToast(activeToastId, true);
    }

    if (toastTimer) {
        clearTimeout(toastTimer);
    }

    const toastId = `toast-${toastCounter++}`;
    activeToastId = toastId;

    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast ${type}`;

    switch (type) {
        case 'success':
            message = `<i class="bi bi-check-lg"></i> ${message}`;
            break;
        case 'error':
            message = `<i class="bi bi-x-lg"></i> ${message}`;
            break;
        case 'warning':
            message = `<i class="bi bi-exclamation-triangle"></i> ${message}`;
            break;
    
        default:
            message = `<i class="bi bi-info-circle"></i> ${message}`;
            break;
    }

    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="closeToast('${toastId}')">✕</button>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    toastTimer = setTimeout(() => {
        closeToast(toastId);
    }, duration);

    return toastId;
}

function closeToast(toastId, immediate = false) {
    const toast = document.getElementById(toastId);

    if (!toast) return;

    if (activeToastId === toastId) {
        activeToastId = null;
    }

    if (immediate) {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    } else {
        toast.classList.remove('show');
        toast.classList.add('hide');

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}