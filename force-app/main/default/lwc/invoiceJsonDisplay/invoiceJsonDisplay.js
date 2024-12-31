import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getOpportunityDetails from '@salesforce/apex/InvoiceCreateController.getOpportunityDetails';

export default class InvoiceJsonDisplay extends NavigationMixin(LightningElement) {
    @api recordId; 
    jsonData;

    @wire(getOpportunityDetails, { opportunityId: '$recordId' })
    opportunityDetails({ data, error }) {
        if (data) {
            const invoiceData = this.createInvoiceData(data);
            this.jsonData = JSON.stringify(invoiceData, null, 2);
        } else if (error) {
            this.showToast('Error', 'Error fetching data', 'error');
        }
    }

    createInvoiceData(data) {
        const lineItems = data.lineItems.map(item => ({
            description: item.Name,
            quantity: item.Quantity,
            unit_price: item.UnitPrice,
            amount: item.Quantity * item.UnitPrice
        }));

        const invoiceData = {
            type: 'ACCREC',
            contact_id: '0000000', 
            date: data.invoiceDate,
            due_date: data.dueDate,
            line_items: lineItems,
            total: lineItems.reduce((sum, item) => sum + item.amount, 0) 
        };

        return invoiceData;
    }

    handleShowJSON() {
        if (this.jsonData) {
            this[NavigationMixin.Navigate]({
                type: 'standard__navItemPage',
                attributes: {
                    apiName: 'ShowInvoiceJson',
                },
                state: {
                    c__jsonData: encodeURIComponent(this.jsonData),
                },
            });
        } else {
            this.showToast('Error', 'JSON data is not available.', 'error');
        }
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(evt);
    }
}
