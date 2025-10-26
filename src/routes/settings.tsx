"use client";

import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useSettings } from '~/context/SettingsProvider';
import { useAppSession } from '~/utils/session';
import { updateSettingsServerFn } from '~/server/chat.server';

import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { cn } from '~/lib/utils';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { session } = useAppSession();
  const [status, setStatus] = useState<'idle' | 'error'>('idle');
  const [isSaving, setIsSaving] = useState(false);

  const setField = useCallback(
    <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
      updateSettings({ [key]: value } as any);
      setStatus('idle');
    },
    [updateSettings]
  );

  const handleSave = useCallback(() => {
    if (typeof window === 'undefined') return;
    setIsSaving(true);
    try {
      if (!session.userId) {
        setStatus('error');
        toast.error('Vous devez être connecté pour enregistrer vos paramètres.');
        setIsSaving(false);
        return;
      }

      const updateSettings = async () => {
        try {
          const result = await updateSettingsServerFn({
            data: {
              user_id: String(session.userId),
              new_given_name: settings.fullName,
              new_notion_token: settings.notionToken,
              new_niveau_etude: settings.study,
            },
          });

          setStatus('idle');
          toast.success('Modifications enregistrées.', {
            className:
              'border border-emerald-400 bg-emerald-100 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-100',
          });
          setTimeout(() => {
            window.history.back();
          }, 200);
        } catch (error) {
          setStatus('error');
          toast.error("Impossible d'enregistrer vos modifications.");
        } finally {
          setIsSaving(false);
        }
      };

      updateSettings();
    } catch (error) {
      console.error('Unable to save settings', error);
      setStatus('error');
      toast.error("Impossible d'enregistrer vos modifications.");
      setIsSaving(false);
    }
  }, [settings, session.userId]);

  return (
    <div className="flex w-full flex-1 justify-center bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl flex-1 flex-col gap-6 p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold">Paramètres du compte</h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos informations personnelles, vos accès et vos préférences.
          </p>
        </div>

        <Card
          className={cn(
            "flex flex-col gap-6 rounded-3xl border border-white/20 dark:border-white/10",
            "bg-[rgba(255,255,255,0.12)] dark:bg-[rgba(24,24,27,0.45)]",
            "backdrop-blur-2xl backdrop-saturate-150",
            "shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-300 p-8"
          )}
        >
          <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
            <div className="flex flex-col gap-4">
              {session.userEmail && (
                <Card
                  className={cn(
                    "rounded-2xl border border-white/20 dark:border-white/10",
                    "bg-[rgba(255,255,255,0.15)] dark:bg-[rgba(24,24,27,0.4)]",
                    "backdrop-blur-xl backdrop-saturate-150",
                    "shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_6px_16px_rgba(0,0,0,0.2)]",
                    "transition-all duration-300 p-4"
                  )}
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={session.userEmail}
                      disabled
                      className="bg-opacity-50 cursor-not-allowed"
                    />
                  </div>
                </Card>
              )}
              <SettingsField
                label="Nom complet"
                placeholder="Alex Dupont"
                value={settings.fullName}
                onChange={(val) => setField('fullName', val)}
              />
            </div>

            <Card
              className={cn(
                "rounded-2xl border border-white/20 dark:border-white/10",
                "bg-[rgba(255,255,255,0.15)] dark:bg-[rgba(24,24,27,0.4)]",
                "backdrop-blur-xl backdrop-saturate-150",
                "shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_6px_16px_rgba(0,0,0,0.2)]",
                "transition-all duration-300 hover:scale-[1.01]",
                "hover:shadow-[inset_0_1px_4px_rgba(255,255,255,0.6),0_10px_25px_rgba(0,0,0,0.25)] p-4"
              )}
            >
              <div className="space-y-2">
                <Label htmlFor="niveau">Niveau d'étude</Label>
                <Textarea
                  id="niveau"
                  placeholder="Licence Informatique, Master Design, etc."
                  className="min-h-[120px] resize-none"
                  value={settings.study}
                  onChange={(e) => setField('study', e.target.value)}
                />
              </div>
            </Card>
          </div>

          {status === 'error' && (
            <div className="rounded-lg border border-destructive bg-destructive/10 px-4 py-2 text-sm text-destructive">
              Impossible d'enregistrer vos modifications. Réessayez plus tard.
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="ghost"
              type="button"
              onClick={() => window.history.back()}
              className={cn(
                "transition-all duration-300",
                "border border-white/10 bg-[rgba(255,255,255,0.1)] dark:bg-[rgba(24,24,27,0.5)]",
                "backdrop-blur-lg hover:scale-[1.02]",
                "hover:shadow-[0_4px_18px_rgba(0,0,0,0.25)]"
              )}
            >
              Annuler
            </Button>
            <Button
              variant="default"
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                "transition-all duration-300 bg-emerald-500 text-white",
                "hover:scale-[1.03] hover:bg-emerald-400",
                "shadow-[0_6px_20px_rgba(16,185,129,0.4)]"
              )}
            >
              {isSaving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SettingsField({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useMemo(
    () => label.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-field',
    [label]
  );

  return (
    <Card
      className={cn(
        "rounded-2xl border border-white/20 dark:border-white/10",
        "bg-[rgba(255,255,255,0.15)] dark:bg-[rgba(24,24,27,0.4)]",
        "backdrop-blur-xl backdrop-saturate-150",
        "shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_6px_16px_rgba(0,0,0,0.2)]",
        "transition-all duration-300 hover:scale-[1.01]",
        "hover:shadow-[inset_0_1px_4px_rgba(255,255,255,0.6),0_10px_25px_rgba(0,0,0,0.25)] p-4"
      )}
    >
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          name={id}
          placeholder={placeholder}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </Card>
  );
}
