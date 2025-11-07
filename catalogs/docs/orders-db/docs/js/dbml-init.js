(function () {
  function renderDbmlBlocks() {
    if (!window.DBMLRenderer) {
      console.warn('DBMLRenderer not available');
      return;
    }
    document.querySelectorAll('pre > code.language-dbml').forEach((codeBlock, index) => {
      const pre = codeBlock.parentElement;
      const wrapper = document.createElement('div');
      wrapper.className = 'dbml-diagram-wrapper';
      pre.insertAdjacentElement('afterend', wrapper);
      const dbmlText = codeBlock.textContent;
      try {
        window.DBMLRenderer.render(wrapper, dbmlText, {
          theme: 'light',
          interactive: true,
        });
      } catch (error) {
        console.error('Failed to render DBML diagram', error);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderDbmlBlocks);
  } else {
    renderDbmlBlocks();
  }
})();
