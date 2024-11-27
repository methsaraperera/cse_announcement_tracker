import { FilterManager } from './filterManager.js';

export function initializeDropdowns() {
    const filterManager = new FilterManager();
    const stockDropdown = document.getElementById('stockDropdown');
    const stockDropdownBtn = document.getElementById('stockDropdownBtn');
    const categoryDropdown = document.getElementById('categoryDropdown');
    const announcementTypeSelectBtn = document.getElementById('announcementTypeSelectBtn');

    // Stock dropdown toggle
    stockDropdownBtn.addEventListener('click', (event) => {
        const isHidden = stockDropdown.classList.contains('hidden');
        stockDropdown.classList.toggle('hidden', !isHidden);
        event.stopPropagation();
    });

    // Category dropdown toggle
    announcementTypeSelectBtn.addEventListener('click', (event) => {
        const isHidden = categoryDropdown.classList.contains('hidden');
        categoryDropdown.classList.toggle('hidden', !isHidden);
        event.stopPropagation();
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
        if (!stockDropdown.contains(event.target) && !stockDropdownBtn.contains(event.target)) {
            stockDropdown.classList.add('hidden');
        }
        if (!categoryDropdown.contains(event.target) && !announcementTypeSelectBtn.contains(event.target)) {
            categoryDropdown.classList.add('hidden');
        }
    });

    // Handle stock checkbox changes
    stockDropdown.addEventListener('change', (event) => {
        if (event.target.classList.contains('stock-checkbox')) {
            const stockId = event.target.value;
            const stockSymbol = event.target.id;
            const stockName = event.target.parentElement.textContent.trim();
            filterManager.toggleStockFilter(stockId, stockSymbol, stockName);
        }
    });

    // Handle category checkbox changes
    categoryDropdown.addEventListener('change', (event) => {
        if (event.target.classList.contains('category-checkbox')) {
            const categoryId = event.target.id;
            const categoryName = event.target.value;
            filterManager.toggleCategoryFilter(categoryId, categoryName);
        }
    });

    return filterManager;
}
