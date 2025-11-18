import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { SYNC_LANGAGES } from './langage-sync.config';

async function cleanDatabase() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🧹 Nettoyage des résidus en base de données...\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    let totalCleaned = 0;

    // 1. Supprimer les versions LTS pour les langages qui n'ont pas ltsSupport
    console.log('📋 Étape 1: Nettoyage des versions LTS incorrectes');
    console.log('─────────────────────────────────────────────────────────\n');

    const configMap = new Map(SYNC_LANGAGES.map(c => [c.nameInDb, c]));
    const allLangages = await langageModel.find().exec();

    for (const langage of allLangages) {
      const config = configMap.get(langage.name);
      const hasLtsVersion = langage.versions?.some((v: any) => v.type === 'lts');

      // Si le langage a une version LTS en base mais pas ltsSupport:true dans la config
      if (hasLtsVersion && config && !config.ltsSupport) {
        console.log(`  ⚠️  ${langage.name}: Suppression de la version LTS (non supportée)`);

        await langageModel.updateOne(
          { name: langage.name },
          { $pull: { versions: { type: 'lts' } } }
        ).exec();

        totalCleaned++;
      }
    }

    console.log('\n📋 Étape 2: Nettoyage des préfixes "v" restants');
    console.log('─────────────────────────────────────────────────────────\n');

    // 2. Nettoyer les préfixes "v" dans toutes les versions
    for (const langage of allLangages) {
      let needsUpdate = false;
      const updatedVersions = (langage.versions || []).map((v: any) => {
        if (/^v\d/.test(v.label)) {
          console.log(`  🔧 ${langage.name} (${v.type}): "${v.label}" → "${v.label.substring(1)}"`);
          needsUpdate = true;
          return { ...v, label: v.label.substring(1) };
        }
        return v;
      });

      if (needsUpdate) {
        await langageModel.updateOne(
          { name: langage.name },
          { $set: { versions: updatedVersions } }
        ).exec();
        totalCleaned++;
      }
    }

    console.log('\n📋 Étape 3: Nettoyage des autres préfixes non normalisés');
    console.log('─────────────────────────────────────────────────────────\n');

    // 3. Nettoyer d'autres préfixes
    const prefixPatterns = [
      { pattern: /^php-/, name: 'PHP', replacement: '' },
      { pattern: /^swift-/, name: 'Swift', replacement: '' },
      { pattern: /^docker-v?/, name: 'Docker', replacement: '' },
      { pattern: /^bun-v/, name: 'Bun', replacement: '' },
      { pattern: /^OTP-/, name: 'Erlang', replacement: '' },
      { pattern: /^ocaml-/, name: 'OCaml', replacement: '' },
    ];

    for (const langage of allLangages) {
      let needsUpdate = false;
      const updatedVersions = (langage.versions || []).map((v: any) => {
        for (const { pattern, replacement } of prefixPatterns) {
          if (pattern.test(v.label)) {
            const newLabel = v.label.replace(pattern, replacement);
            console.log(`  🔧 ${langage.name} (${v.type}): "${v.label}" → "${newLabel}"`);
            needsUpdate = true;
            return { ...v, label: newLabel };
          }
        }
        return v;
      });

      if (needsUpdate) {
        await langageModel.updateOne(
          { name: langage.name },
          { $set: { versions: updatedVersions } }
        ).exec();
        totalCleaned++;
      }
    }

    console.log('\n📋 Étape 4: Suppression des versions aberrantes connues');
    console.log('─────────────────────────────────────────────────────────\n');

    // 4. Supprimer les versions aberrantes connues
    const aberrantVersions = [
      { name: 'C++', version: '5014.0.0' },
      { name: 'Perl', version: '2009.0.0' },
      { name: 'Haskell', version: '11550.0.0' },
      { name: 'Django', version: '2010.0.0' },
      { name: 'Flutter', version: '24.0.0' },
      { name: 'Delphi', version: '2010.0.0' },
      { name: 'Unity', version: '2019.4.40f1' }, // Si c'est vraiment aberrant
    ];

    for (const { name, version } of aberrantVersions) {
      const result = await langageModel.updateOne(
        { name },
        { $pull: { versions: { label: version } } }
      ).exec();

      if (result.modifiedCount > 0) {
        console.log(`  🗑️  ${name}: Suppression de la version aberrante "${version}"`);
        totalCleaned++;
      }
    }

    console.log('\n📋 Étape 5: Vérification finale');
    console.log('─────────────────────────────────────────────────────────\n');

    // 5. Vérification finale - afficher les langages problématiques restants
    const langagesAfter = await langageModel.find().exec();
    let remainingIssues = 0;

    for (const langage of langagesAfter) {
      const issues: string[] = [];

      for (const v of langage.versions || []) {
        if (/^v\d/.test(v.label)) {
          issues.push(`préfixe "v" dans ${v.type}: ${v.label}`);
        }
        if (/^(php-|swift-|docker-|bun-|ocaml-|OTP-)/.test(v.label)) {
          issues.push(`préfixe non normalisé dans ${v.type}: ${v.label}`);
        }
      }

      if (issues.length > 0) {
        console.log(`  ⚠️  ${langage.name}:`);
        issues.forEach(issue => console.log(`      - ${issue}`));
        remainingIssues++;
      }
    }

    if (remainingIssues === 0) {
      console.log('  ✅ Aucun problème détecté');
    }

    console.log('\n\n📊 RÉSUMÉ DU NETTOYAGE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total de modifications effectuées: ${totalCleaned}`);
    console.log(`Problèmes restants: ${remainingIssues}`);
    console.log('\n✅ Nettoyage terminé !');

  } finally {
    await app.close();
  }
}

cleanDatabase().catch(error => {
  console.error('❌ Erreur lors du nettoyage:', error);
  process.exit(1);
});
