import './bootstrap';

const ready = (callback) => {
    if (document.readyState !== 'loading') {
        callback();
    } else {
        document.addEventListener('DOMContentLoaded', callback);
    }
};

ready(() => {
    document.querySelectorAll('[data-language-select]').forEach((select) => {
        select.addEventListener('change', () => {
            select.form?.submit();
        });
    });

    const modal = document.querySelector('[data-photo-modal]');
    const modalImage = modal?.querySelector('[data-photo-modal-image]');

    if (!modal || !modalImage) {
        return;
    }

    const closeModal = () => {
        modal.setAttribute('hidden', 'hidden');
        modalImage.setAttribute('src', '');
    };

    modal.querySelectorAll('[data-photo-dismiss]').forEach((element) => {
        element.addEventListener('click', closeModal);
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.querySelectorAll('[data-photo-preview]').forEach((button) => {
        button.addEventListener('click', () => {
            const source = button.getAttribute('data-photo-preview');
            if (!source) {
                return;
            }

            modalImage.setAttribute('src', source);
            modal.removeAttribute('hidden');
        });
    });
});
