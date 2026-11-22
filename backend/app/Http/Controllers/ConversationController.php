<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use App\Models\Conversation;
use App\Models\Message;
use App\Notifications\CampusNotification;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    private const USER = 'id,name,prenom,etablissement,photo';

    public function index(Request $request)
    {
        $moi = $request->user()->id;

        $conversations = Conversation::query()
            ->where(fn ($q) => $q->where('acheteur_id', $moi)->orWhere('vendeur_id', $moi))
            ->with(['annonce.photos', 'acheteur:' . self::USER, 'vendeur:' . self::USER, 'dernierMessage'])
            ->withCount(['messages as non_lus' => fn ($q) => $q->where('user_id', '!=', $moi)->whereNull('lu_at')])
            ->orderByDesc('dernier_message_at')
            ->get();

        return response()->json($conversations);
    }

    public function nonLus(Request $request)
    {
        return response()->json(['non_lus' => $this->compterNonLus($request->user()->id)]);
    }

    public function show(Request $request, Conversation $conversation)
    {
        abort_unless($conversation->participe($request->user()), 403, 'Cette conversation ne te concerne pas.');

        $conversation->messages()
            ->where('user_id', '!=', $request->user()->id)
            ->whereNull('lu_at')
            ->update(['lu_at' => now()]);

        return response()->json(
            $conversation->load(['annonce.photos', 'annonce.categorie', 'acheteur:' . self::USER, 'vendeur:' . self::USER, 'messages'])
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'annonce_id' => 'required|integer|exists:annonces,id',
            'contenu'    => 'required|string|max:2000',
        ], ['contenu.required' => 'Le message ne peut pas être vide.']);

        $annonce = Annonce::findOrFail($data['annonce_id']);
        abort_if($annonce->user_id === $request->user()->id, 422, 'Tu ne peux pas t\'envoyer un message sur ta propre annonce.');

        $conversation = Conversation::firstOrCreate(
            ['annonce_id' => $annonce->id, 'acheteur_id' => $request->user()->id],
            ['vendeur_id' => $annonce->user_id]
        );

        $message = $this->ajouter($conversation, $request, $data['contenu']);

        return response()->json([
            'message'      => 'Message envoyé.',
            'conversation' => $conversation->fresh(),
            'envoye'       => $message,
        ], 201);
    }

    public function envoyer(Request $request, Conversation $conversation)
    {
        abort_unless($conversation->participe($request->user()), 403, 'Cette conversation ne te concerne pas.');

        $data = $request->validate(
            ['contenu' => 'required|string|max:2000'],
            ['contenu.required' => 'Le message ne peut pas être vide.']
        );

        return response()->json(['message' => 'Message envoyé.', 'envoye' => $this->ajouter($conversation, $request, $data['contenu'])], 201);
    }

    private function ajouter(Conversation $conversation, Request $request, string $contenu): Message
    {
        $moi = $request->user();
        $destinataire = $conversation->autre($moi);

        $dejaNonLu = $conversation->messages()->where('user_id', $moi->id)->whereNull('lu_at')->exists();

        $message = $conversation->messages()->create(['user_id' => $moi->id, 'contenu' => $contenu]);
        $conversation->update(['dernier_message_at' => $message->created_at]);

        if (! $dejaNonLu && $destinataire) {
            $conversation->loadMissing('annonce');
            $destinataire->notify(new CampusNotification(
                'message_nouveau',
                'Nouveau message de ' . $moi->prenom,
                ["{$moi->prenom} t'a écrit à propos de « {$conversation->annonce->titre} » :", '« ' . mb_strimwidth($contenu, 0, 200, '…') . ' »'],
                'Répondre', '/messages/' . $conversation->id
            ));
        }

        return $message;
    }

    private function compterNonLus(int $moi): int
    {
        return Message::whereNull('lu_at')->where('user_id', '!=', $moi)
            ->whereHas('conversation', fn ($q) => $q->where('acheteur_id', $moi)->orWhere('vendeur_id', $moi))
            ->count();
    }
}
