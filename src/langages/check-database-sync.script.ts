import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkDatabaseSync() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔍 VÉRIFICATION DE LA SYNCHRONISATION BASE/CONFIG\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const { SYNC_LANGAGES } = await import('./langage-sync.config');

    const issues: any[] = [];
    const toSync: any[] = [];

    // Vérifier les langages avec ltsSupport modifié
    const changedLtsSupport = [
      { name: 'Python', shouldHaveLts: false, reason: 'ltsSupport retiré (pas de distinction LTS officielle)' },
      { name: 'MongoDB', shouldHaveLts: false, reason: 'ltsSupport retiré (pas de LTS formel)' },
      { name: 'PostgreSQL', shouldHaveLts: false, reason: 'ltsSupport retiré (pas de distinction LTS)' },
      { name: 'Laravel', shouldHaveLts: true, reason: 'ltsSupport ajouté (versions LTS officielles)' },
      { name: 'C#', shouldHaveLts: true, reason: 'ltsSupport ajouté (suit .NET LTS)' },
      { name: 'Symfony', shouldHaveLts: true, reason: 'ltsSupport ajouté (versions LTS 4 ans)' },
      { name: 'Django', shouldHaveLts: true, reason: 'ltsSupport ajouté (versions LTS 3 ans)' }
    ];

    console.log('📋 LANGAGES AVEC ltsSupport MODIFIÉ:\n');

    for (const check of changedLtsSupport) {
      const lang = await langageModel.findOne({ name: check.name }).exec();
      const config = SYNC_LANGAGES.find((c: any) => c.nameInDb === check.name);

      if (!lang) {
        console.log(`⚠️  ${check.name}: Langage introuvable en base`);
        continue;
      }

      const hasLtsInDb = lang.versions?.some((v: any) => v.type === 'lts');
      const hasLtsInConfig = config?.ltsSupport === true;

      console.log(`🔹 ${check.name}:`);
      console.log(`   Config: ltsSupport = ${hasLtsInConfig}`);
      console.log(`   Base: version LTS = ${hasLtsInDb ? 'OUI' : 'NON'}`);

      if (check.shouldHaveLts && !hasLtsInDb) {
        console.log(`   ❌ DÉSYNCHRONISÉ - Devrait avoir une version LTS`);
        console.log(`   💡 ${check.reason}`);
        toSync.push(check.name);
      } else if (!check.shouldHaveLts && hasLtsInDb) {
        const ltsVersion = lang.versions?.find((v: any) => v.type === 'lts');
        console.log(`   ⚠️  DÉSYNCHRONISÉ - A encore une version LTS: ${ltsVersion?.label}`);
        console.log(`   💡 ${check.reason}`);
        issues.push({ name: check.name, hasLts: true, ltsVersion: ltsVersion?.label });
      } else {
        console.log(`   ✅ SYNCHRONISÉ`);
      }
      console.log('');
    }

    console.log('\n💡 RÉSUMÉ:');
    console.log('═══════════════════════════════════════════════════════════\n');

    const synced = changedLtsSupport.length - issues.length - toSync.length;
    console.log(`  ✅ Synchronisés: ${synced}/${changedLtsSupport.length}`);
    console.log(`  ❌ À nettoyer (LTS à supprimer): ${issues.length}`);
    console.log(`  🔄 À synchroniser (LTS manquante): ${toSync.length}`);

    if (issues.length > 0) {
      console.log('\n\n📋 ACTIONS NÉCESSAIRES - Supprimer les versions LTS:');
      console.log('─────────────────────────────────────────────────────────');
      issues.forEach((issue) => {
        console.log(`  • ${issue.name}: Supprimer la version LTS (${issue.ltsVersion})`);
      });
    }

    if (toSync.length > 0) {
      console.log('\n\n📋 ACTIONS NÉCESSAIRES - Re-synchroniser pour ajouter LTS:');
      console.log('─────────────────────────────────────────────────────────');
      toSync.forEach((name) => {
        console.log(`  • ${name}: Lancer la synchronisation pour récupérer la version LTS`);
      });
    }

    if (issues.length === 0 && toSync.length === 0) {
      console.log('\n🎉 La base de données est synchronisée avec la configuration!');
    } else {
      console.log(`\n⚠️  ${issues.length + toSync.length} action(s) nécessaire(s) pour synchroniser`);
    }

  } finally {
    await app.close();
  }
}

checkDatabaseSync().catch(error => {
  console.error('❌ Erreur lors de la vérification:', error);
  process.exit(1);
});
