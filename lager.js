
 class SyncProductChunk {
  constructor() {
    this.allButtons = [];
    this.myButton = document.createElement('button');
    this.message = document.querySelector('#order-message');
    this.loader = document.querySelector('#obj_fortnox_loading');
    this.chunkSize = 5;

    this.setupButton();
  }

  toggleLoading() {
    this.loader.style.display = this.loader.style.display === 'none' ? 'block' : 'none';
    this.allButtons.forEach(button => {
      button.disabled = !button.disabled;
    });
  }

  setupButton() {
    this.myButton.id = 'sync-products-chunk';
    this.myButton.className = 'button button-secondary';
    this.myButton.innerHTML = 'Smart Synkning';

    const syncProductStock = document.getElementById('sync-product-stock');
    syncProductStock.parentNode.insertBefore(this.myButton, syncProductStock.nextSibling);

    this.myButton.addEventListener('click', this.handleButtonClick.bind(this));
  }

  async fetchData(action, method, body) {
    try {
      const response = await fetch(ajaxurl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=${action}&method=${method}${body ? `&${body}` : ''}`,
      });

      return await response.json();
    } catch (error) {
      console.error('AJAX request failed:', error);
      return null;
    }
  }

  async handleButtonClick() {
    this.allButtons = document.querySelectorAll('.fortnox-sync, #sync-products-chunk');
    this.toggleLoading();
    this.message.value = 'Startar synkning av lager\n';

    const syncData = await this.fetchData('sync_fortknox_lager_chunks', 'get');
    if (syncData !== null) {
      console.log(syncData);

      const chunkedArray = Array.from(
        { length: Math.ceil(syncData.length / this.chunkSize) },
        (_, i) => syncData.slice(i * this.chunkSize, (i + 1) * this.chunkSize)
      );
      let i=0;
      for (const chunk of chunkedArray) {
        const responseData = await this.fetchData('sync_fortknox_lager_chunks', 'update', `chunk=${chunk}`);
        if (responseData !== null) {
          this.message.value += `${(i * this.chunkSize) + 5} klara av ${syncData.length}\n${responseData.message}`;
          this.message.scrollTo({
            top: this.message.scrollHeight,
            behavior: 'smooth',
          });

          if (i === chunkedArray.length - 1) {
            this.toggleLoading();
          }
        }
        i++;
      }
    }else{
      this.toggleLoading();
      this.message.value = 'Inga produkter att synka';
    }
  }
}

const syncProductChunk = new SyncProductChunk();
