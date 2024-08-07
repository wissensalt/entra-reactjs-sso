import axios from "axios";

const meEndpoint = 'https://graph.microsoft.com/v1.0/me';

export const callMsGraphMe = async (accessToken: string): Promise<any> => {
    try {
        const response = await axios.get(meEndpoint, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error calling MS Graph API:', error);
        throw error;
    }
};