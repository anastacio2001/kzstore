import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Bell, BellOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../utils/supabase/client';

interface WaitingListButtonProps {
  productId: string;
  preSaleId: string;
  onSuccess?: () => void;
}

export default function WaitingListButton({ productId, preSaleId, onSuccess }: WaitingListButtonProps) {
  const { user } = useAuth();
  const [isOnWaitingList, setIsOnWaitingList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [waitingListCount, setWaitingListCount] = useState(0);

  useEffect(() => {
    if (user) {
      checkWaitingListStatus();
      getWaitingListCount();
    } else {
      setChecking(false);
    }
  }, [user, preSaleId]);

  async function checkWaitingListStatus() {
    if (!user) return;

    try {
      setChecking(true);
      
      const { data, error } = await supabase
        .from('waiting_list')
        .select('id')
        .eq('pre_sale_id', preSaleId)
        .eq('user_id', user.id)
        .eq('notified', false)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      setIsOnWaitingList(!!data);
    } catch (error: any) {
      console.error('Error checking waiting list status:', error);
    } finally {
      setChecking(false);
    }
  }

  async function getWaitingListCount() {
    try {
      const { count, error } = await supabase
        .from('waiting_list')
        .select('*', { count: 'exact', head: true })
        .eq('pre_sale_id', preSaleId)
        .eq('notified', false);

      if (error) throw error;

      setWaitingListCount(count || 0);
    } catch (error: any) {
      console.error('Error getting waiting list count:', error);
    }
  }

  async function joinWaitingList() {
    if (!user) {
      toast.error('Faça login para entrar na lista de espera');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('waiting_list')
        .insert({
          pre_sale_id: preSaleId,
          user_id: user.id,
          product_id: productId
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Você já está na lista de espera');
        } else {
          throw error;
        }
        return;
      }

      toast.success('✅ Você entrou na lista de espera! Avisaremos quando houver vagas.');
      setIsOnWaitingList(true);
      setWaitingListCount(prev => prev + 1);
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error joining waiting list:', error);
      toast.error('Erro ao entrar na lista de espera');
    } finally {
      setLoading(false);
    }
  }

  async function leaveWaitingList() {
    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('waiting_list')
        .delete()
        .eq('pre_sale_id', preSaleId)
        .eq('user_id', user.id)
        .eq('notified', false);

      if (error) throw error;

      toast.success('Você saiu da lista de espera');
      setIsOnWaitingList(false);
      setWaitingListCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Error leaving waiting list:', error);
      toast.error('Erro ao sair da lista de espera');
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <button
        disabled
        className="w-full bg-gray-700 text-gray-400 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
      >
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        Carregando...
      </button>
    );
  }

  if (isOnWaitingList) {
    return (
      <div className="space-y-3">
        <button
          onClick={leaveWaitingList}
          disabled={loading}
          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-5 h-5" />
          {loading ? 'Processando...' : 'Na Lista de Espera'}
        </button>
        
        <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
          <p className="text-green-400 text-sm text-center">
            ✅ Você será notificado quando houver vagas disponíveis
          </p>
        </div>

        <button
          onClick={leaveWaitingList}
          disabled={loading}
          className="w-full text-gray-400 hover:text-gray-300 text-sm underline"
        >
          Sair da lista de espera
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={joinWaitingList}
        disabled={loading || !user}
        className="w-full bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Bell className="w-5 h-5" />
        {loading ? 'Entrando...' : 'Entrar na Lista de Espera'}
      </button>

      {waitingListCount > 0 && (
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-gray-400 text-sm text-center">
            <span className="font-semibold text-yellow-400">{waitingListCount}</span>{' '}
            {waitingListCount === 1 ? 'pessoa está' : 'pessoas estão'} na lista de espera
          </p>
        </div>
      )}

      {!user && (
        <p className="text-gray-400 text-sm text-center">
          Faça login para entrar na lista de espera
        </p>
      )}
    </div>
  );
}
