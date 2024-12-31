public with sharing class InvoiceCreateController {
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getOpportunityDetails(Id opportunityId) {
        Opportunity opp = [SELECT Id, AccountId, CloseDate, Invoice_Due_Date__c,
                           (SELECT Id, Name, Quantity, UnitPrice FROM OpportunityLineItems)
                           FROM Opportunity WHERE Id = :opportunityId LIMIT 1];
        
        Map<String, Object> invoiceData = new Map<String, Object>();
        invoiceData.put('Id', opp.Id);
        invoiceData.put('account', opp.AccountId);
        invoiceData.put('invoiceDate', opp.CloseDate);
        invoiceData.put('dueDate', opp.Invoice_Due_Date__c); 
        invoiceData.put('referenced', 'Invoice is been created from apex backend'); 
        
        List<Map<String, Object>> lineItems = new List<Map<String, Object>>();
        for (OpportunityLineItem oli : opp.OpportunityLineItems) {
            Map<String, Object> lineItem = new Map<String, Object>();
            lineItem.put('Name', oli.Name);
            lineItem.put('Quantity', oli.Quantity);
            lineItem.put('UnitPrice', oli.UnitPrice);
            lineItems.add(lineItem);
        }
        invoiceData.put('lineItems', lineItems);
        return invoiceData;
    }
   
    @AuraEnabled
    public static void createInvoiceandInvoiceLineItems(String jsonData) {
        if (String.isBlank(jsonData)) {
            throw new AuraHandledException('No invoice data provided.');
        }
        try {
            Map<String, Object> dataMap = (Map<String, Object>) JSON.deserializeUntyped(jsonData);
            if (dataMap == null) {
                throw new AuraHandledException('Invoice data is missing or invalid');
            }
            if (!dataMap.containsKey('line_items')) {
                throw new AuraHandledException('Line items are missing from the data');
            }
         
            String accountId = (String) dataMap.get('account_id');
            String invoiceReference = (String) dataMap.get('reference');
            String invoiceDate = (String) dataMap.get('date');
            String dueDate = (String) dataMap.get('due_date');
            Decimal total = (Decimal) dataMap.get('total');
            List<Object> lineItems = (List<Object>) dataMap.get('line_items');
            List<Invoice_Line_Item__c> lineItemRecords = new List<Invoice_Line_Item__c>();

            for (Object lineItemRaw : lineItems) {
                Map<String, Object> lineItem = (Map<String, Object>) lineItemRaw;

                Invoice_Line_Item__c lineItemRecord = new Invoice_Line_Item__c(
                    Line_Description__c = (String) lineItem.get('description'),
                    Quantity__c = (Decimal) lineItem.get('quantity'),
                    Unit_Price__c = (Decimal) lineItem.get('unit_price')
                );
                lineItemRecords.add(lineItemRecord);
            }

            Invoice__c invoiceRecord = new Invoice__c(
                Account__c = accountId,
                Invoice_Reference__c = invoiceReference,
                Invoice_Date__c = Date.valueOf(invoiceDate),
                Due_Date__c = Date.valueOf(dueDate)
            );
            insert invoiceRecord;
    
            for (Invoice_Line_Item__c lineItem : lineItemRecords) {
                lineItem.Invoice__c = invoiceRecord.Id;
            }
            insert lineItemRecords;
        } catch (Exception e) {
            System.debug('Error in creating invoice and line items: ' + e.getMessage());
            throw new AuraHandledException('Error in creating invoice and line items: ' + e.getMessage());
        }
    }
}