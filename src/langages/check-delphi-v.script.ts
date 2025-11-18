import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkDelphiAndV() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔍 Analyse de Delphi et V\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Récupérer les configurations
    const { SYNC_LANGAGES } = await import('./langage-sync.config');
    const delphiConfig = SYNC_LANGAGES.find(c => c.nameInDb === 'Delphi');
    const vConfig = SYNC_LANGAGES.find(c => c.nameInDb === 'V');

    console.log('📋 Configuration Delphi:');
    console.log(`  sourceType: ${delphiConfig?.sourceType}`);
    console.log(`  sourceUrl: ${delphiConfig?.sourceUrl}`);
    console.log('');

    console.log('📋 Configuration V:');
    console.log(`  sourceType: ${vConfig?.sourceType}`);
    console.log(`  sourceUrl: ${vConfig?.sourceUrl}`);
    console.log('');

    // Récupérer les versions en base
    const delphi = await langageModel.findOne({ name: 'Delphi' }).exec();
    const v = await langageModel.findOne({ name: 'V' }).exec();

    console.log('📊 Versions Delphi en base de données:');
    console.log('─────────────────────────────────────────────────────────');
    if (delphi?.versions && delphi.versions.length > 0) {
      delphi.versions.forEach((ver: any) => {
        console.log(`  ${ver.type}: ${ver.label}`);
      });
    } else {
      console.log('  ⚠️  Aucune version trouvée (probablement supprimée lors du nettoyage)');
    }

    console.log('\n📊 Versions V en base de données:');
    console.log('─────────────────────────────────────────────────────────');
    if (v?.versions && v.versions.length > 0) {
      v.versions.forEach((ver: any) => {
        console.log(`  ${ver.type}: ${ver.label}`);
      });
    } else {
      console.log('  ⚠️  Aucune version trouvée');
    }

    console.log('\n\n🔎 DIAGNOSTIC');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Diagnostic Delphi
    console.log('🔹 Delphi:');
    console.log('─────────────────────────────────────────────────────────');
    if (!delphi?.versions || delphi.versions.length === 0) {
      console.log('  ❌ Problème: Aucune version en base');
      console.log('  💡 Cause probable: Version "2010.0.0" supprimée lors du nettoyage');
      console.log('  💡 Solution: Re-synchroniser Delphi');
    } else {
      console.log('  ✅ Versions présentes');
    }

    // Diagnostic V
    console.log('\n🔹 V (Vlang):');
    console.log('─────────────────────────────────────────────────────────');
    const vCurrent = v?.versions?.find((ver: any) => ver.type === 'current')?.label;
    if (vCurrent) {
      console.log(`  📋 Version actuelle: ${vCurrent}`);

      // Vérifier le format
      if (/^weekly\.\d{4}\.\d+$/.test(vCurrent)) {
        console.log('  ⚠️  Format détecté: weekly.YYYY.WW');
        console.log('  💡 Problème: Le format "weekly" n\'est pas user-friendly');
        console.log('  💡 V utilise un versioning hebdomadaire (weekly releases)');
        console.log('  💡 Exemple: weekly.2025.47 = Semaine 47 de 2025');
        console.log('  💡 Options:');
        console.log('      1. Garder le format weekly (sémantiquement correct)');
        console.log('      2. Utiliser les releases officielles si disponibles');
        console.log('      3. Formater en date lisible (ex: "2025-W47")');
      } else {
        console.log(`  ✅ Format: ${vCurrent}`);
      }
    }

    console.log('\n\n💡 RECOMMANDATIONS');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('Pour Delphi:');
    console.log('  1. Re-synchroniser pour récupérer la version depuis Wikipedia');
    console.log('  2. Vérifier que le custom updater fonctionne correctement');
    console.log('');

    console.log('Pour V:');
    console.log('  1. V utilise des weekly releases (pas de versions stables classiques)');
    console.log('  2. Options de formatage:');
    console.log('     • Garder "weekly.2025.47" (sémantiquement correct)');
    console.log('     • Formater en "0.4.9" si des tags semver existent');
    console.log('     • Formater en "2025-W47" (plus lisible)');

  } finally {
    await app.close();
  }
}

checkDelphiAndV().catch(error => {
  console.error('❌ Erreur lors de l\'analyse:', error);
  process.exit(1);
});
