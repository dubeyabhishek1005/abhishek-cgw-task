public class InvoiceHandler {
    @AuraEnabled(cacheable=true)
    public static List<OpportunityLineItem> fetchLineItems(Id parentId) {
        // Query OpportunityLineItems
        return [
            SELECT Id, Description, Quantity, UnitPrice, 
                   Opportunity.AccountId, Opportunity.Invoice_Due_Date__c,
                   Opportunity.CloseDate
            FROM OpportunityLineItem
            WHERE OpportunityId = :parentId
        ];
    }
    
    @AuraEnabled
    public static String insertInvoice(Id parentId){
        List<Invoice_Line_Item__c> lstInvoiceLineItem = new List<Invoice_Line_Item__c>();
        Invoice__c objInvoice = new Invoice__c();
        for(Opportunity opp: [Select Id, AccountId, Invoice_Due_Date__c, CloseDate from Opportunity where Id =: parentId LIMIT 1]){
            objInvoice.Account__c = opp.AccountId;
            objInvoice.Due_Date__c = opp.Invoice_Due_Date__c;
            objInvoice.Invoice_Date__c = opp.CloseDate;
            objInvoice.Invoice_Reference__c = 'This Invoice is been generated from Opportunity.';
        }
        if(objInvoice!=null){
            insert objInvoice;
        }
        for(OpportunityLineItem lineItem : [SELECT Id, Description, Quantity, UnitPrice, Opportunity.AccountId, Opportunity.Invoice_Due_Date__c, Opportunity.CloseDate FROM OpportunityLineItem WHERE OpportunityId = :parentId]){   
            Invoice_Line_Item__c obbjInvoiceLineItem = new Invoice_Line_Item__c();
            obbjInvoiceLineItem.Line_Description__c = lineItem.Description;
            obbjInvoiceLineItem.Quantity__c = lineItem.Quantity;
            obbjInvoiceLineItem.Unit_Price__c = lineItem.UnitPrice;
            lstInvoiceLineItem.add(obbjInvoiceLineItem);
        } 
        for(Invoice_Line_Item__c ili : lstInvoiceLineItem){
            ili.Invoice__c = objInvoice.Id;
        }
        if(!lstInvoiceLineItem.isEmpty()){
            try{
                insert lstInvoiceLineItem;
                system.debug('lstInvoices'+lstInvoiceLineItem);
                system.debug('objInvoice'+objInvoice);
                return 'Invoices inserted successfully';
            } catch (Exception ex){
                return 'Error while inserting invoices: ' + ex.getMessage();
            }  
        } else {
            return 'Nothing to insert';
        }
    }
}