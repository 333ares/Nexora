<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\File;

class GenerateTranslations extends Command
{
    protected $signature = 'translations:generate';
    protected $description = 'Genera en.json y ca.json a partir de es.json usando LibreTranslate';

    private string $libreTranslateUrl = 'http://nexora_libretranslate:5000/translate';

    public function handle(): int
    {
        $basePath = base_path('../frontend/public/i18n');
        $sourcePath = $basePath . '/es.json';

        if (!File::exists($sourcePath)) {
            $this->error("No se encontró el archivo: {$sourcePath}");
            return 1;
        }

        $sourceData = json_decode(File::get($sourcePath), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error('Error al parsear es.json: ' . json_last_error_msg());
            return 1;
        }

        $targetLanguages = ['en', 'ca'];

        foreach ($targetLanguages as $targetLang) {
            $this->info("Generando traducciones para: {$targetLang}...");
            $translated = $this->translateRecursive($sourceData, 'es', $targetLang);

            $outputPath = $basePath . "/{$targetLang}.json";
            File::put($outputPath, json_encode($translated, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            $this->info("✓ Archivo generado: {$outputPath}");
        }

        $this->info('¡Traducciones generadas correctamente!');
        return 0;
    }

    private function translateRecursive(array $data, string $source, string $target): array
    {
        $result = [];

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $result[$key] = $this->translateRecursive($value, $source, $target);
            } elseif (is_string($value)) {
                $result[$key] = $this->translateText($value, $source, $target);
            } else {
                $result[$key] = $value;
            }
        }

        return $result;
    }

    private function translateText(string $text, string $source, string $target): string
    {
        if (trim($text) === '' || $text === '→') {
            return $text;
        }

        try {
            $response = Http::timeout(30)->post($this->libreTranslateUrl, [
                'q' => $text,
                'source' => $source,
                'target' => $target,
                'format' => 'text',
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['translatedText'] ?? $text;
            }

            $this->warn("Error traduciendo '{$text}': HTTP {$response->status()}");
            return $text;
        } catch (\Exception $e) {
            $this->warn("Excepción traduciendo '{$text}': {$e->getMessage()}");
            return $text;
        }
    }
}
