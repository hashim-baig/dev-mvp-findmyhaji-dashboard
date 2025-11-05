import Network from '@/lib/Network';
import { Urls } from '@/lib/utils';


async function getMenus() {
    try {
      const token = localStorage.getItem('findmyhaji_token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
      
      const response = await Network.get(Urls.baseUrl + '/menus/sidemenu', headers);
      if (response?.data?.success === 'success') {
        return response.data.data;
      } else {
        console.error('Failed to fetch menus:', response?.data?.message);
        return [];
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
      return [];
    }
}
export { getMenus };

