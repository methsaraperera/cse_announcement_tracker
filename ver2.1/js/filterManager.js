export class FilterManager {
    constructor() {
        this.selectedStocksMap = new Map();
        this.selectedCategories = new Set();
        this.stockFiltersContainer = document.getElementById('selectedFiltersStock');
        this.categoryFiltersContainer = document.getElementById('selectedFiltersCategories');
    }

    toggleStockFilter(stockId, stockSymbol, stockName) {
        const filterKey = `stock-${stockId}`;
        if (this.selectedStocksMap.has(stockId)) {
            this.selectedStocksMap.delete(stockId);
            this.removeFilterLabel(filterKey);
        } else {
            this.selectedStocksMap.set(stockId, { symbol: stockSymbol, name: stockName });
            this.addStockFilterLabel(filterKey, stockSymbol);
        }
        this.updateContainerVisibility();
    }

    toggleCategoryFilter(categoryId, categoryName) {
        const filterKey = `category-${categoryId}`;
        if (this.selectedCategories.has(categoryId)) {
            this.selectedCategories.delete(categoryId);
            this.removeFilterLabel(filterKey);
        } else {
            this.selectedCategories.add(categoryId);
            this.addCategoryFilterLabel(filterKey, categoryName);
        }
        this.updateContainerVisibility();
    }

    addStockFilterLabel(filterKey, stockSymbol) {
        const label = document.createElement('div');
        label.id = filterKey;
        label.className = 'inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium';
        label.innerHTML = `
            ${stockSymbol}
            <button class="ml-2 text-blue-600 hover:text-blue-800" data-filter-key="${filterKey}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        `;
        this.stockFiltersContainer.appendChild(label);
        this.addRemoveButtonListener(label.querySelector('button'));
    }

    addCategoryFilterLabel(filterKey, categoryName) {
        const label = document.createElement('div');
        label.id = filterKey;
        label.className = 'inline-flex items-center bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-medium';
        label.innerHTML = `
            ${categoryName}
            <button class="ml-2 text-green-600 hover:text-green-800" data-filter-key="${filterKey}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        `;
        this.categoryFiltersContainer.appendChild(label);
        this.addRemoveButtonListener(label.querySelector('button'));
    }

    removeFilterLabel(filterKey) {
        const stockLabel = this.stockFiltersContainer.querySelector(`#${filterKey}`);
        const categoryLabel = this.categoryFiltersContainer.querySelector(`#${filterKey}`);
        
        if (stockLabel) {
            stockLabel.remove();
        }
        if (categoryLabel) {
            categoryLabel.remove();
        }
        
        this.updateContainerVisibility();
    }

    updateContainerVisibility() {
        // Show/hide stock filters container based on content
        if (this.selectedStocksMap.size === 0) {
            this.stockFiltersContainer.classList.add('hidden');
        } else {
            this.stockFiltersContainer.classList.remove('hidden');
        }

        // Show/hide category filters container based on content
        if (this.selectedCategories.size === 0) {
            this.categoryFiltersContainer.classList.add('hidden');
        } else {
            this.categoryFiltersContainer.classList.remove('hidden');
        }
    }

    addRemoveButtonListener(button) {
        button.addEventListener('click', (e) => {
            const filterKey = e.currentTarget.getAttribute('data-filter-key');
            if (filterKey.startsWith('stock-')) {
                const stockId = filterKey.replace('stock-', '');
                const checkbox = document.querySelector(`input[value="${stockId}"]`);
                if (checkbox) {
                    checkbox.checked = false;
                }
                this.selectedStocksMap.delete(stockId);
            } else if (filterKey.startsWith('category-')) {
                const categoryId = filterKey.replace('category-', '');
                const checkbox = document.querySelector(`input[id="${categoryId}"]`);
                if (checkbox) {
                    checkbox.checked = false;
                }
                this.selectedCategories.delete(categoryId);
            }
            this.removeFilterLabel(filterKey);
        });
    }

    getSelectedStockIds() {
        return Array.from(this.selectedStocksMap.keys());
    }

    getSelectedCategoryIds() {
        return Array.from(this.selectedCategories);
    }

    clearAllFilters() {
        this.selectedStocksMap.clear();
        this.selectedCategories.clear();
        this.stockFiltersContainer.innerHTML = '';
        this.categoryFiltersContainer.innerHTML = '';
        this.updateContainerVisibility();
    }
}