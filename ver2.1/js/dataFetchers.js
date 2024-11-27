import { API_ENDPOINTS } from './config.js';

export async function fetchStocks() {
    try {
        const response = await fetch(API_ENDPOINTS.securities);
        const data = await response.json();
        return data.content;
    } catch (error) {
        console.error("Error fetching stocks:", error);
        return [];
    }
}

export async function fetchCategories() {
    try {
        const response = await fetch(API_ENDPOINTS.announcementCategories);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export async function fetchAnnouncements() {
    const currentDate = new Date().toISOString().split('T')[0];
    const previousDate = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];

    try {
        const stockData = await fetch(API_ENDPOINTS.securities).then(res => res.json());
        const companyIds = stockData.content.map(stock => stock.securityId).join(',');
        
        const response = await fetch(API_ENDPOINTS.notices, {
            method: 'POST',
            body: new URLSearchParams({
                fromDate: previousDate,
                toDate: currentDate,
                companyIds: companyIds
            })
        });
        const data = await response.json();
        return data.approvedAnnouncements || [];
    } catch (error) {
        console.error("Error fetching announcements:", error);
        return [];
    }
}

export async function fetchAnnouncementDetails(announcementId) {
    const formData = new FormData();
    formData.append('announcementId', announcementId);

    try {
        const response = await fetch(API_ENDPOINTS.announcementDetail, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if (!data.reqBaseAnnouncement) {
            return fetchFallbackAnnouncementDetails(announcementId);
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching announcement details:', error);
        return fetchFallbackAnnouncementDetails(announcementId);
    }
}

async function fetchFallbackAnnouncementDetails(announcementId) {
    try {
        const response = await fetch(API_ENDPOINTS.fallbackAnnouncementDetail, {
            method: 'POST',
            body: new URLSearchParams({ announcementId })
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching fallback announcement details:', error);
        return null;
    }
}
