import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function QuoteRequestForm() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [requirements, setRequirements] = useState('');
  const [budget, setBudget] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        throw new Error('Você precisa estar logado para enviar solicitações de orçamento');
      }

      // Get token from localStorage
      let token = localStorage.getItem('token');
      if (!token) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            token = userData.access_token || userData.token;
          } catch (e) {
            // ignore
          }
        }
      }

      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch('/api/tickets', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          user_name: user.name || name,
          user_email: user.email || email,
          subject: 'Solicitação de orçamento',
          category: 'quote',
          priority: 'normal',
          description: `${requirements}
Budget: ${budget || 'N/A'}`,
        })
      });
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setName('');
        setEmail('');
        setPhone('');
        setRequirements('');
        setBudget('');
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Solicitar Orçamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Orçamento Personalizado</DialogTitle>
          <DialogDescription>
            Descreva suas necessidades e receba uma proposta sob medida
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Solicitação Enviada!</h3>
            <p className="text-gray-600">
              Nossa equipe irá analisar e enviar uma proposta em breve
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required />
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefone" required />
            <Textarea 
              value={requirements} 
              onChange={(e) => setRequirements(e.target.value)} 
              placeholder="Descreva o que precisa (ex: 10 laptops i5, 8GB RAM para escritório)"
              rows={4}
              required
            />
            <Input 
              type="number" 
              value={budget} 
              onChange={(e) => setBudget(e.target.value)} 
              placeholder="Orçamento disponível (opcional) - AOA"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
