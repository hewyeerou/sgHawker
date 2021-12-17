import sendgrid from 'sendgrid';
import settings from '../../config/settings';

const SendGridClient = sendgrid(settings.SENDGRID_API_KEY);
export default SendGridClient;
