import { useState } from 'react';
import { Package, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../utils/supabase/client';

export function TradeInForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    product_model: '',
    product_brand: '',
    product_condition: 'Bom',
    product_year: new Date().getFullYear(),
    has_box: false,
    has_accessories: false,
    description: '',
    customer_name: user?.email?.split('@')[0] || '',
    customer_phone: ''
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 5) {
      alert('Máximo 5 imagens permitidas');
      return;
    }

    setImageFiles([...imageFiles, ...files]);

    // Criar previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Uploading to trade-in bucket:', filePath);

      const { error: uploadError, data } = await supabase.storage
        .from('trade-in')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw new Error(`Falha ao fazer upload das imagens: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('trade-in')
        .getPublicUrl(filePath);

      console.log('Uploaded successfully:', publicUrl);
      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const calculateEstimate = () => {
    // Estimativa simples baseada em condição e acessórios
    const baseValues: Record<string, number> = {
      'Excelente': 70,
      'Bom': 50,
      'Aceitável': 30,
      'Ruim': 10
    };

    let estimate = baseValues[formData.product_condition] || 50;
    
    if (formData.has_box) estimate += 10;
    if (formData.has_accessories) estimate += 10;

    // Depreciação por ano (assumindo preço médio de 100.000 Kz)
    const age = new Date().getFullYear() - formData.product_year;
    const depreciation = age * 5; // 5% por ano
    estimate = Math.max(10, estimate - depreciation);

    return Math.round((100000 * estimate) / 100); // Valor em Kz
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Faça login para enviar solicitação');
      return;
    }

    if (imageFiles.length === 0) {
      alert('Adicione pelo menos 1 foto do produto');
      return;
    }

    setLoading(true);

    try {
      // Upload das imagens
      console.log('Iniciando upload de', imageFiles.length, 'imagens...');
      const imageUrls = await uploadImages();
      console.log('Upload concluído. URLs:', imageUrls);

      if (imageUrls.length === 0) {
        throw new Error('Falha ao fazer upload das imagens. Verifique se o bucket "trade-in" existe no Supabase Storage.');
      }

      const estimatedValue = calculateEstimate();

      // Criar solicitação de trade-in
      console.log('Criando solicitação de trade-in...');
      const { error } = await supabase
        .from('trade_in_requests')
        .insert({
          customer_email: user.email,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          product_model: formData.product_model,
          product_brand: formData.product_brand,
          product_condition: formData.product_condition,
          product_year: formData.product_year,
          has_box: formData.has_box,
          has_accessories: formData.has_accessories,
          description: formData.description,
          images: imageUrls,
          estimated_value: estimatedValue,
          status: 'pending'
        });

      if (error) {
        console.error('Erro ao inserir no banco:', error);
        throw error;
      }

      console.log('Solicitação criada com sucesso!');
      setSubmitted(true);
      alert('Solicitação enviada com sucesso! Você receberá uma avaliação em até 48h.');
    } catch (error: any) {
      console.error('Error submitting trade-in:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusCode: error.statusCode,
        details: error.details
      });
      alert(error.message || 'Erro ao enviar solicitação. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <CheckCircle size={64} className="mx-auto text-green-600 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Solicitação Enviada!</h2>
        <p className="text-gray-600 mb-6">
          Recebemos sua solicitação de trade-in. Nossa equipe irá avaliar seu produto e entrar em contacto em até 48 horas úteis.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Estimativa inicial: <span className="font-bold text-green-600">{calculateEstimate().toLocaleString('pt-AO')} Kz</span>
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setFormData({
              product_model: '',
              product_brand: '',
              product_condition: 'Bom',
              product_year: new Date().getFullYear(),
              has_box: false,
              has_accessories: false,
              description: '',
              customer_name: user?.email?.split('@')[0] || '',
              customer_phone: ''
            });
            setImageFiles([]);
            setImagePreviews([]);
          }}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          Enviar Outra Solicitação
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <Package size={48} />
          <div>
            <h2 className="text-2xl font-bold">Programa Trade-In</h2>
            <p className="text-purple-100">Troque seu produto usado por crédito na loja</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Como funciona:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Preencha o formulário com detalhes do seu produto</li>
              <li>Envie fotos nítidas do produto</li>
              <li>Nossa equipe avalia e oferece um valor de crédito</li>
              <li>Você aprova e envia o produto</li>
              <li>Recebe crédito para usar na próxima compra</li>
            </ol>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Marca *</label>
            <input
              type="text"
              value={formData.product_brand}
              onChange={(e) => setFormData({ ...formData, product_brand: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Ex: Apple, Samsung, Dell"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Modelo *</label>
            <input
              type="text"
              value={formData.product_model}
              onChange={(e) => setFormData({ ...formData, product_model: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Ex: iPhone 13 Pro, Galaxy S21"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Condição *</label>
            <select
              value={formData.product_condition}
              onChange={(e) => setFormData({ ...formData, product_condition: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="Excelente">Excelente - Como novo</option>
              <option value="Bom">Bom - Sinais leves de uso</option>
              <option value="Aceitável">Aceitável - Marcas visíveis</option>
              <option value="Ruim">Ruim - Muito usado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ano de Compra *</label>
            <input
              type="number"
              value={formData.product_year}
              onChange={(e) => setFormData({ ...formData, product_year: parseInt(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2"
              min="2010"
              max={new Date().getFullYear()}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Seu Nome *</label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Telefone *</label>
            <input
              type="tel"
              value={formData.customer_phone}
              onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="+244 9XX XXX XXX"
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.has_box}
              onChange={(e) => setFormData({ ...formData, has_box: e.target.checked })}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm">Tenho a caixa original (+10% valor)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.has_accessories}
              onChange={(e) => setFormData({ ...formData, has_accessories: e.target.checked })}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm">Tenho todos os acessórios (carregador, cabo, etc) (+10% valor)</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição do Estado</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
            rows={4}
            placeholder="Descreva o estado do produto: arranhões, funcionamento, bateria, etc..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Fotos do Produto * (máx 5)</label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Upload size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Tire fotos nítidas de todos os ângulos
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
              disabled={imageFiles.length >= 5}
            />
            <label
              htmlFor="image-upload"
              className={`inline-block bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-700 ${
                imageFiles.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Escolher Fotos
            </label>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Estimativa de Crédito:</p>
          <p className="text-3xl font-bold text-green-600">{calculateEstimate().toLocaleString('pt-AO')} Kz</p>
          <p className="text-xs text-gray-500 mt-1">
            *Valor aproximado. O valor final será definido após avaliação técnica.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || imageFiles.length === 0}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enviando...' : 'Enviar Solicitação'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Ao enviar, você concorda com os termos do programa Trade-In
        </p>
      </form>
    </div>
  );
}
