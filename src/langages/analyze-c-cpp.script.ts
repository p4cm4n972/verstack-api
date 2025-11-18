import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function analyzeCandCpp() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔍 Analyse de C et C++\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Récupérer les configurations
    const { SYNC_LANGAGES } = await import('./langage-sync.config');
    const cConfig = SYNC_LANGAGES.find(c => c.nameInDb === 'C');
    const cppConfig = SYNC_LANGAGES.find(c => c.nameInDb === 'C++');

    console.log('📋 Configuration C:');
    console.log(`  sourceType: ${cConfig?.sourceType}`);
    console.log(`  sourceUrl: ${cConfig?.sourceUrl}`);
    console.log(`  standardSupport: ${cConfig?.standardSupport}`);
    console.log('');

    console.log('📋 Configuration C++:');
    console.log(`  sourceType: ${cppConfig?.sourceType}`);
    console.log(`  sourceUrl: ${cppConfig?.sourceUrl}`);
    console.log(`  useTags: ${cppConfig?.useTags}`);
    console.log(`  standardSupport: ${cppConfig?.standardSupport}`);
    console.log('');

    // Récupérer les versions en base
    const c = await langageModel.findOne({ name: 'C' }).exec();
    const cpp = await langageModel.findOne({ name: 'C++' }).exec();

    console.log('📊 Versions C en base de données:');
    console.log('─────────────────────────────────────────────────────────');
    if (c?.versions) {
      c.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
    } else {
      console.log('  ⚠️  Aucune version trouvée');
    }

    console.log('\n📊 Versions C++ en base de données:');
    console.log('─────────────────────────────────────────────────────────');
    if (cpp?.versions) {
      cpp.versions.forEach((v: any) => {
        console.log(`  ${v.type}: ${v.label}`);
      });
    } else {
      console.log('  ⚠️  Aucune version trouvée');
    }

    console.log('\n\n📖 EXPLICATION DES STANDARDS');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('🔹 C (Langage de programmation):');
    console.log('─────────────────────────────────────────────────────────');
    console.log('  Standards ISO officiels:');
    console.log('    • C89/C90 (ANSI C) - 1989');
    console.log('    • C99 (ISO/IEC 9899:1999) - 1999');
    console.log('    • C11 (ISO/IEC 9899:2011) - 2011');
    console.log('    • C17 (ISO/IEC 9899:2018) - 2017');
    console.log('    • C23 (ISO/IEC 9899:2023) - 2023 (dernière version)');
    console.log('');
    console.log('  Source actuelle: custom (scraping Wikipedia)');
    console.log('  Champ "standard" : Devrait contenir le(s) standard(s) détecté(s)');
    console.log('  Champ "current"  : Devrait être le standard le plus récent');
    console.log('');

    console.log('🔹 C++ (Langage de programmation):');
    console.log('─────────────────────────────────────────────────────────');
    console.log('  Standards ISO officiels:');
    console.log('    • C++98 (ISO/IEC 14882:1998) - 1998');
    console.log('    • C++03 (ISO/IEC 14882:2003) - 2003');
    console.log('    • C++11 (ISO/IEC 14882:2011) - 2011');
    console.log('    • C++14 (ISO/IEC 14882:2014) - 2014');
    console.log('    • C++17 (ISO/IEC 14882:2017) - 2017');
    console.log('    • C++20 (ISO/IEC 14882:2020) - 2020');
    console.log('    • C++23 (ISO/IEC 14882:2023) - 2023 (dernière version)');
    console.log('    • C++26 (en cours de développement)');
    console.log('');
    console.log('  Source actuelle: GitHub cplusplus/draft (working drafts)');
    console.log('  Tags: Format "nXXXX" (ex: n5014 = draft numéro 5014)');
    console.log('  Champ "standard" : Devrait contenir le dernier draft (nXXXX)');
    console.log('  Champ "current"  : Devrait être le standard publié (C++23)');
    console.log('');

    console.log('\n🔎 ANALYSE DES VERSIONS ACTUELLES');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Analyse C
    console.log('🔹 Analyse C:');
    console.log('─────────────────────────────────────────────────────────');
    const cCurrent = c?.versions?.find((v: any) => v.type === 'current')?.label;
    const cStandard = c?.versions?.find((v: any) => v.type === 'standard')?.label;

    if (cCurrent === 'C23') {
      console.log('  ✅ current = C23 (correct, dernière version)');
    } else {
      console.log(`  ⚠️  current = ${cCurrent} (attendu: C23)`);
    }

    if (cStandard) {
      console.log(`  📋 standard = ${cStandard}`);
      if (cStandard.includes('C99')) {
        console.log('      ⚠️  Ancien standard détecté (C99), devrait aussi détecter C11, C17, C23');
      }
    }

    // Analyse C++
    console.log('\n🔹 Analyse C++:');
    console.log('─────────────────────────────────────────────────────────');
    const cppCurrent = cpp?.versions?.find((v: any) => v.type === 'current')?.label;
    const cppStandard = cpp?.versions?.find((v: any) => v.type === 'standard')?.label;

    if (cppCurrent === 'C++23') {
      console.log('  ✅ current = C++23 (correct, dernière version publiée)');
    } else {
      console.log(`  ⚠️  current = ${cppCurrent} (attendu: C++23)`);
    }

    if (cppStandard && /^n\d{4}$/.test(cppStandard)) {
      console.log(`  ✅ standard = ${cppStandard} (draft actuel, format correct)`);
    } else {
      console.log(`  ⚠️  standard = ${cppStandard} (attendu: format nXXXX)`);
    }

    console.log('\n\n💡 RECOMMANDATIONS');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('Pour C:');
    console.log('  • current devrait être "C23" (dernière version stable)');
    console.log('  • standard pourrait lister tous les standards majeurs');
    console.log('  • Source Wikipedia peut être incomplète, vérifier manuellement');
    console.log('');

    console.log('Pour C++:');
    console.log('  • current devrait être "C++23" (dernière version stable)');
    console.log('  • standard devrait être le dernier draft (format nXXXX)');
    console.log('  • La configuration actuelle semble correcte');

  } finally {
    await app.close();
  }
}

analyzeCandCpp().catch(error => {
  console.error('❌ Erreur lors de l\'analyse:', error);
  process.exit(1);
});
