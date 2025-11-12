-- Make tax_id nullable and add default values for required fields

-- Make tax_id nullable (it's duplicated by cnpj)
ALTER TABLE business_accounts ALTER COLUMN tax_id DROP NOT NULL;

-- Make other fields nullable that should be optional
ALTER TABLE business_accounts ALTER COLUMN industry DROP NOT NULL;
ALTER TABLE business_accounts ALTER COLUMN address DROP NOT NULL;
ALTER TABLE business_accounts ALTER COLUMN city DROP NOT NULL;
ALTER TABLE business_accounts ALTER COLUMN contact_person DROP NOT NULL;
ALTER TABLE business_accounts ALTER COLUMN contact_phone DROP NOT NULL;
ALTER TABLE business_accounts ALTER COLUMN contact_email DROP NOT NULL;

-- Set default values for existing rows if needed
UPDATE business_accounts SET tax_id = cnpj WHERE tax_id IS NULL AND cnpj IS NOT NULL;
UPDATE business_accounts SET industry = 'Outros' WHERE industry IS NULL;
