import { LightningElement, track , wire} from 'lwc';
import fetchLineItems from '@salesforce/apex/InvoiceHandler.fetchLineItems';
import { CurrentPageReference } from 'lightning/navigation';
export default class CreateInvoice extends LightningElement {
    @track params = [];
    connectedCallback() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        console.log('urlParams:'+urlParams);
        this.params = [...urlParams.entries()].map(([key, value]) => ({ name: key, value }));
    }
    @track urlParams = {};
    @track lineItems = [];

    // Retrieve parameters from the URL
    @wire(CurrentPageReference)
    getPageParameters(currentPage) {
        if (currentPage && currentPage.state) {
            this.urlParams = {
                origin_record: currentPage.state.c__origin_record || '',
                child_relationship_name: currentPage.state.c__child_relationship_name || '',
                line_item_description: currentPage.state.c__line_item_description || '',
                line_item_unit_price: currentPage.state.c__line_item_unit_price || '',
                line_item_quantity: currentPage.state.c__line_item_quantity || ''
            };

            console.log('URL Parameters:', this.urlParams.origin_record); // Add this line for debugging

            // If we have the origin record ID, fetch line items
            if (this.urlParams.origin_record) {
                this.fetchLineItemData(this.urlParams.origin_record);
            }
        }
    }

    // Fetch line items based on the Opportunity ID
    fetchLineItemData(recordId) {
        fetchLineItems({ parentId: recordId })
            .then((data) => {
                this.lineItems = data.map((item) => ({
                    id: item.Id,
                    description: item.Product2.Name,
                    quantity: item.Quantity,
                    unitPrice: item.UnitPrice
                }));
                
                this.params = [
                    ...this.params,  // Spread the previous params (if any)
                    { name: 'Opportunity Line Items', value: JSON.stringify(lineItemData) }  // Add as stringified JSON
                ];
                console.log('Fetched Line Items:', JSON.stringify(this.lineItems)); // Add this line for debugging
            })
            .catch((error) => {
                console.error('Error fetching line items:', error);
            });
    }
}