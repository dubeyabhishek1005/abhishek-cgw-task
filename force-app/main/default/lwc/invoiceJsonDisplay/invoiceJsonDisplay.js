import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getOpportunityDetails from '@salesforce/apex/InvoiceCreateController.getOpportunityDetails';

export default class InvoiceJsonDisplay extends NavigationMixin(LightningElement) {
    @api recordId; 
    jsonData;
    queryParameters = {};

    @wire(CurrentPageReference)
    currentPageReference({ state }) {
        if (state) {
            this.queryParameters = state;
        }
    }

    @wire(getOpportunityDetails, { opportunityId: '$recordId', queryFields: '$queryParameters'})
    opportunityDetails({ data, error }) {
        if (data) {
            const invoiceData = this.createInvoiceData(data);
            this.jsonData = JSON.stringify(invoiceData, null, 2);
        } else if (error) {
            this.showToast('Error', 'Error fetching data', 'error');
        }
    }

    createInvoiceData(data) {
        const lineItems = [];
        const urlParams = new URLSearchParams(window.location.search);
        const date = urlParams.get('c__invoice_date') || data.invoiceDate;
        const due_date =  urlParams.get('c__invoice_due_date') || data.dueDate;

        for (let i = 0; i < 4; i++) {
            const descriptionFromURL = urlParams.get(`c__line_item_description${i}`);
            const quantityFromURL = urlParams.get(`c__line_item_quantity${i}`);
            const unitPriceFromURL = urlParams.get(`c__line_item_unit_price${i}`);

            const description = descriptionFromURL || data.lineItems[i].Description;
            const quantity = quantityFromURL ? parseInt(quantityFromURL, 10) : data.lineItems[i].Quantity;
            const unitPrice = unitPriceFromURL ? parseFloat(unitPriceFromURL) : data.lineItems[i].UnitPrice;

            if (description && quantity > 0 && unitPrice > 0) {
                const lineItem = {
                    description: description,
                    quantity: quantity,
                    unit_price: unitPrice
                };
                lineItems.push(lineItem);
            }
        }
        
        const invoiceData = {
            account_id: data.account, 
            opportunityId: data.Id,
            reference: data.referenced,
            contact_id: '0000000', 
            date: date, 
            due_date: due_date,
            line_items: lineItems,
        };
        console.log('Generated Invoice JSON:', JSON.stringify(invoiceData, null, 2));
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