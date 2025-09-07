(() => {
  const toast = document.getElementById('toast-notification');
  let toastTimeout;

  function showToast(message) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.add('toast-visible');
    toastTimeout = setTimeout(() => {
      toast.classList.remove('toast-visible');
    }, 2000);
  }

  document.querySelectorAll('.highlightable').forEach(el => {
    el.title = 'Click to copy';
    el.addEventListener('click', () => {
      const textToCopy = el.textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied: ${textToCopy}`);
        }).catch(err => {
          console.error('Failed to copy text: ', err);
          showToast('Error: Could not copy');
        });
      }
    });
  });
})();