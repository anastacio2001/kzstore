import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://kzstore_app:Kzstore2024!@127.0.0.1:3307/kzstore_prod"
    }
  }
});

const BUCKET_URL = 'https://storage.googleapis.com/kzstore-images';

// Mapeamento de IDs para nomes de arquivos
const imageMap: Record<string, string> = {
  'ca52654a-41ab-4414-a3f0-c245aaf4182d': 'product-ca52654a-41ab-4414-a3f0-c245aaf4182d-KL104195CFSPAPDVDNCD.webp',
  'ea71163a-28bc-4530-91e1-5eeb798c6aa2': 'product-ea71163a-28bc-4530-91e1-5eeb798c6aa2-image_1270.webp',
  '60154395-3e3a-45d8-b2a3-d1defc24dd0b': 'product-60154395-3e3a-45d8-b2a3-d1defc24dd0b-GSD-1222VHP1.jpg',
  'eb623d23-dd74-40e7-a004-a058622a374d': 'product-eb623d23-dd74-40e7-a004-a058622a374d-TL-SG1005D-SWITCH-5P-TPLINK-1.webp',
  'e3d9ef42-4330-4ce1-992e-0c1c1f34ae08': 'product-e3d9ef42-4330-4ce1-992e-0c1c1f34ae08-TL-SF1005D.webp',
  'b1d93df0-2145-48e4-b80d-75b0184592df': 'product-b1d93df0-2145-48e4-b80d-75b0184592df-TS64GUSD300S.jpg',
  'd6670a17-b02e-40ca-89fc-073ca08f4e39': 'product-d6670a17-b02e-40ca-89fc-073ca08f4e39-SDSQUNR-032G-GN3MN.jpg',
  '3185c02b-54e4-47ea-8001-2d635beca0cb': 'product-3185c02b-54e4-47ea-8001-2d635beca0cb-KINGSTON-CARTAO-DE-MEMORIA-32G.jpg',
  'a9e14339-3c52-4b3a-88d9-ae454acb4acf': 'product-a9e14339-3c52-4b3a-88d9-ae454acb4acf-nordvpn-pc-mac-linux-android-ios.jpg',
  '4f170c70-2e9a-469d-8ba4-596f99ba726a': 'product-4f170c70-2e9a-469d-8ba4-596f99ba726a-office-2024-home-business.jpg',
  'b26c6797-6d3b-463d-96db-616acc99d6e6': 'product-b26c6797-6d3b-463d-96db-616acc99d6e6-office-2024-professional-plus-new1.jpg',
  '375b5f48-a03a-4979-bccf-52d566247426': 'product-375b5f48-a03a-4979-bccf-52d566247426-windows-11-professional-32-64-bit-licenza-microsof.jpg',
  '97d1845b-6c19-41e8-8f98-a25a389b57c9': 'product-97d1845b-6c19-41e8-8f98-a25a389b57c9-Etikette-2058x100mm-20weiss-20Thermodirekt-1200x12.jpg',
  '1adc475e-6549-4073-a4c6-06afcaa3bcaa': 'product-1adc475e-6549-4073-a4c6-06afcaa3bcaa-574011TER.jpg',
  'a474a07b-e4dd-4f19-a27c-0900e9846031': 'product-a474a07b-e4dd-4f19-a27c-0900e9846031--api-rest-00ed29448a7522f610cac04d7b9ea7e0-assets-.jpg',
  'e760c420-191e-4bb6-82c3-f2eff5317485': 'product-e760c420-191e-4bb6-82c3-f2eff5317485-cartuccia-hp-d-inchiostro-nero-3ym61ae-305-120-pag.jpg',
  'c92ed87a-06c7-47ab-b565-18fffe1e0175': 'product-c92ed87a-06c7-47ab-b565-18fffe1e0175-hp-925-yellow-original-ink-cartridge-tinteiro-1-un.jpg',
  'be171dee-de76-4be5-8f49-7c6bacb07dcd': 'product-be171dee-de76-4be5-8f49-7c6bacb07dcd-81TYBjl6c1L.jpg',
  '38f0e432-02d9-4505-aee8-61f5918a6dc6': 'product-38f0e432-02d9-4505-aee8-61f5918a6dc6-61ctk5JZdsL.jpg',
  'b82a988d-ae92-47ad-9278-931771b37b7e': 'product-b82a988d-ae92-47ad-9278-931771b37b7e-imagem_2025-02-10_152307469-png.png',
  'fca7c090-0bd0-42c7-aedc-99e8d97e21d0': 'product-fca7c090-0bd0-42c7-aedc-99e8d97e21d0-1520-1.jpg',
  '9b3be6f1-d462-476a-8209-5d0ec84a8347': 'product-9b3be6f1-d462-476a-8209-5d0ec84a8347-WIN91PT.jpg',
  '132c3500-09ba-4934-b156-f57645cf15ff': 'product-132c3500-09ba-4934-b156-f57645cf15ff-6W7E6C.jpg',
  'e07f41fc-c9a2-41bd-b52b-7b08c4cabfab': 'product-e07f41fc-c9a2-41bd-b52b-7b08c4cabfab-xiaomi_portable_electric_air_compressor_2_pro_02_a.jpg',
  'cc86ebaa-f0fe-4c9f-853c-618c3f9ee43f': 'product-cc86ebaa-f0fe-4c9f-853c-618c3f9ee43f-br-11134207-7qukw-lh5i4z0s8q2zeb.jpg',
  '5754687f-859e-440c-b02b-0b79824e9db6': 'product-5754687f-859e-440c-b02b-0b79824e9db6-530071.jpg',
  'e3887256-a068-4f31-9ae3-b539b8c664d0': 'product-e3887256-a068-4f31-9ae3-b539b8c664d0-imagem_2025-02-05_150109264-png.png',
  '3cb3520d-48ce-4504-b22b-6c33aa3ca512': 'product-3cb3520d-48ce-4504-b22b-6c33aa3ca512-436001305790.jpg',
  '6996ba3b-b231-4a84-9300-fd3739984339': 'product-6996ba3b-b231-4a84-9300-fd3739984339-Y1871604-01.jpg',
  'c2f8b61f-1c12-4b98-a1d6-5f4c2ad88558': 'product-c2f8b61f-1c12-4b98-a1d6-5f4c2ad88558-imagem_2025-02-07_150045774-png.png',
  '703174c2-4c92-4da6-8f88-ba5cf9155782': 'product-703174c2-4c92-4da6-8f88-ba5cf9155782-imagem_2025-02-07_150045774-png.png',
  '958dd879-cf05-4c01-93c3-3e6a57808462': 'product-958dd879-cf05-4c01-93c3-3e6a57808462-26-179-158-01_3yq7-kv.jpg',
  '1b8b2939-a786-4750-86db-1a3205ff8c5b': 'product-1b8b2939-a786-4750-86db-1a3205ff8c5b-71MDGnNGWYL.jpg',
  '35125d92-a3e0-4760-aeb5-26259f9f72c6': 'product-35125d92-a3e0-4760-aeb5-26259f9f72c6-161232-1200-auto.jpg',
  'dad88bdd-15bd-4d87-8fbf-57379e001ec2': 'product-dad88bdd-15bd-4d87-8fbf-57379e001ec2-71MDGnNGWYL.jpg',
  '0f33ec31-f3f7-4169-9f4d-8add15c72e25': 'product-0f33ec31-f3f7-4169-9f4d-8add15c72e25-WDBUZG0010BB-.jpg',
  '0ced4ac7-6fba-45ee-8016-3f06fc46d72e': 'product-0ced4ac7-6fba-45ee-8016-3f06fc46d72e-90881200.jpg',
  'f28b8e9a-924d-4681-9c4a-6f653a51d2fb': 'product-f28b8e9a-924d-4681-9c4a-6f653a51d2fb-DTKN-64GB.jpg',
  'e2a4d3fc-b8eb-41f9-a9e1-b77cb0defcda': 'product-e2a4d3fc-b8eb-41f9-a9e1-b77cb0defcda-157893-1200-auto.jpg',
  '904495fe-65ee-47f6-a26d-13261c4ab4be': 'product-904495fe-65ee-47f6-a26d-13261c4ab4be-Cabo-.jpg',
  '7461e81e-534d-4a81-8aec-056a76e835fc': 'product-7461e81e-534d-4a81-8aec-056a76e835fc-336734.jpg',
  'f01dac00-2b19-4504-943f-c8b7b8c43787': 'product-f01dac00-2b19-4504-943f-c8b7b8c43787-155397-1200-auto.jpg',
  '94f03df7-6163-42fa-9c3a-5b3ed6ed5fda': 'product-94f03df7-6163-42fa-9c3a-5b3ed6ed5fda-cat6-05m.jpg',
  '3916494f-b77b-49c0-b6a9-e67a5645ec37': 'product-3916494f-b77b-49c0-b6a9-e67a5645ec37-42406186858-.jpg',
  '494ca584-f5e8-42f5-8331-da2f2dab4e97': 'product-494ca584-f5e8-42f5-8331-da2f2dab4e97-943050419085.jpg',
  'a89a162b-bcf7-4845-a787-3e6ef2feabc7': 'product-a89a162b-bcf7-4845-a787-3e6ef2feabc7-943050419054.jpg',
  'a2a4ecaa-b14d-46ac-89b3-f7282077f85b': 'product-a2a4ecaa-b14d-46ac-89b3-f7282077f85b-168775-1200-auto.jpg',
  '326305cd-4131-4b8a-bb2d-60cdf3cff8ea': 'product-326305cd-4131-4b8a-bb2d-60cdf3cff8ea-161092-1200-auto.jpg',
  '76f08f7e-6cab-424d-8c43-688eb77fade1': 'product-76f08f7e-6cab-424d-8c43-688eb77fade1-171136-1200-auto.jpg',
  '1450a2f0-5387-4f3c-8a36-0a3f11343246': 'product-1450a2f0-5387-4f3c-8a36-0a3f11343246-s-l1600.jpg',
  'dc7de60c-dac0-4226-8e9b-fe3dbc0a8fcc': 'product-dc7de60c-dac0-4226-8e9b-fe3dbc0a8fcc-s-l1600.png',
  '45595488-d67c-491e-9c42-f782a41ae1a0': 'product-45595488-d67c-491e-9c42-f782a41ae1a0-EW9700.jpg',
  'e1e23110-e5db-4c38-a8a4-5c5c99ee0af4': 'product-e1e23110-e5db-4c38-a8a4-5c5c99ee0af4-171615-1200-auto.jpg',
  '2f8f7cb3-fc2a-4d03-8289-87aa6fa6dc9d': 'product-2f8f7cb3-fc2a-4d03-8289-87aa6fa6dc9d-171330-1200-auto.jpg',
  'd2411b03-4376-4f1b-a274-d85cb85f38d4': 'product-d2411b03-4376-4f1b-a274-d85cb85f38d4-163259-1200-auto.jpg',
  '2585494f-6a85-4b2c-a4a3-b22af4b4aee9': 'product-2585494f-6a85-4b2c-a4a3-b22af4b4aee9-EW9864.jpg',
  '5270a6f3-f39f-4c88-859f-99efd1d0fdc4': 'product-5270a6f3-f39f-4c88-859f-99efd1d0fdc4-333405.jpg',
  'b1fad094-330c-408f-a3c5-f772b6120254': 'product-b1fad094-330c-408f-a3c5-f772b6120254-EC1906.jpg',
  '6eee5795-5b64-48e4-a0f4-c1d39f5ab5ae': 'product-6eee5795-5b64-48e4-a0f4-c1d39f5ab5ae-EC1611.jpg',
  '7b7521b1-0ac0-47cd-9349-16f2724acba3': 'product-7b7521b1-0ac0-47cd-9349-16f2724acba3-photo-1606904825846-647eb07f5be2.jpg',
};

async function updateDatabase() {
  console.log('💾 Atualizando base de dados...\n');
  
  let updated = 0;
  let failed = 0;
  const total = Object.keys(imageMap).length;

  for (const [productId, filename] of Object.entries(imageMap)) {
    const newUrl = `${BUCKET_URL}/${filename}`;
    
    try {
      await prisma.product.update({
        where: { id: productId },
        data: { imagem_url: newUrl },
      });
      updated++;
      console.log(`✅ [${updated + failed}/${total}] Produto ${productId.substring(0, 8)}... atualizado`);
    } catch (error: any) {
      failed++;
      console.log(`❌ [${updated + failed}/${total}] Erro em ${productId.substring(0, 8)}...: ${error.message}`);
    }
  }

  await prisma.$disconnect();

  console.log(`\n✨ ATUALIZAÇÃO CONCLUÍDA! ✨`);
  console.log(`📊 Resumo:`);
  console.log(`   - Total de produtos: ${total}`);
  console.log(`   - Atualizados com sucesso: ${updated}`);
  console.log(`   - Falhas: ${failed}`);
  console.log(`   - Taxa de sucesso: ${((updated / total) * 100).toFixed(1)}%`);
}

updateDatabase();
