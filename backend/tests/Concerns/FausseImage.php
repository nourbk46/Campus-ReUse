<?php

namespace Tests\Concerns;

use Illuminate\Http\UploadedFile;

trait FausseImage
{
    protected function fausseImage(string $nom = 'photo.png', int $tailleKo = 0): UploadedFile
    {
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        if ($tailleKo > 0) {
            $png .= str_repeat("\0", $tailleKo * 1024); // grossit le fichier (test de taille max)
        }
        $chemin = tempnam(sys_get_temp_dir(), 'img');
        file_put_contents($chemin, $png);

        return new UploadedFile($chemin, $nom, 'image/png', null, true);
    }
}
