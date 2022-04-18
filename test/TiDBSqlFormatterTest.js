import sqlFormatter from '../src/sqlFormatter';
import behavesLikeSqlFormatter from './behavesLikeSqlFormatter';
import dedent from 'dedent-js';

describe('TiDBSqlFormatter', () => {
  behavesLikeSqlFormatter('tidb');

  const format = (query, cfg = {}) => sqlFormatter.format(query, { ...cfg, language: 'tidb' });

  // related issue: https://github.com/pingcap/tidb-dashboard/issues/798
  it('recognizes @@', () => {
    const result = format('SELECT @@global.tidb_stmt_summary_refresh_interval AS value');
    expect(result).toBe(dedent/* sql */ `
      SELECT
        @@global.tidb_stmt_summary_refresh_interval AS value
    `);
  });

  // related issue: https://github.com/zeroturnaround/sql-formatter/issues/147
  it('format sql contains `false`', () => {
    const sql =
      'select `topics` . `id` from `topics` left outer join `categories` on `categories` . `id` = `topics` . `category_id` where ( `topics` . `archetype` <> ? ) and ( coalesce ( `categories` . `topic_id` , ? ) <> `topics` . `id` ) and `topics` . `visible` = true and ( `topics` . `deleted_at` is ? ) and ( `topics` . `category_id` is ? or `topics` . `category_id` in ( ... ) ) and ( `topics` . `category_id` != ? ) and `topics` . `closed` = false and `topics` . `archived` = false and ( `topics` . `created_at` > ? ) order by `rand` ( ) limit ?';
    const result = format(sql);
    expect(result).toBe(dedent/* sql */ `
      select
        \`topics\`.\`id\`
      from
        \`topics\`
        left outer join \`categories\` on \`categories\`.\`id\` = \`topics\`.\`category_id\`
      where
        (\`topics\`.\`archetype\` <> ?)
        and (
          coalesce (\`categories\`.\`topic_id\`, ?) <> \`topics\`.\`id\`
        )
        and \`topics\`.\`visible\` = true
        and (\`topics\`.\`deleted_at\` is ?)
        and (
          \`topics\`.\`category_id\` is ?
          or \`topics\`.\`category_id\` in (...)
        )
        and (\`topics\`.\`category_id\` != ?)
        and \`topics\`.\`closed\` = false
        and \`topics\`.\`archived\` = false
        and (\`topics\`.\`created_at\` > ?)
      order by
        \`rand\` ()
      limit
        ?
    `);
  });

  it('format sql contains `false` and uppercase', () => {
    const sql =
      'update `app_tidb_en`.`app_tidb_en` set `Today` = \'2022-12-28 11:27:35.604\', `DigTreasureNoPrizeCount` = 1, `DigTreasureDrawCount` = 4, `IntegralExchangeSendName` = NULL, `IntegralExchangeSendPhone` = NULL, `IntegralExchangeSendAddress` = NULL, `DayResetTaskData` = \'{"38":{"Value":5,"HasGet":true,"GetCount":5},"23":{"Value":1,"HasGet":true,"GetCount":0},"15":{"Value":10,"HasGet":true,"GetCount":1},"16":{"Value":30,"HasGet":true,"GetCount":1},"17":{"Value":60,"HasGet":true,"GetCount":1},"22":{"Value":1,"HasGet":false,"GetCount":0}}\', `NotDayResetTaskData` = \'{"27":{"Value":1,"HasGet":true,"GetCount":0},"34":{"Value":1,"HasGet":true,"GetCount":0},"28":{"Value":1,"HasGet":true,"GetCount":0},"18":{"Value":1,"HasGet":false,"GetCount":0},"45":{"Value":1,"HasGet":true,"GetCount":1}}\', `Id` = 12345 where `Id` = 12345 limit 1;';
    const result = format(sql, { uppercase: true });
    expect(result).toBe(dedent`
      UPDATE
        \`app_tidb_en\`.\`app_tidb_en\`
      SET
        \`Today\` = '2022-12-28 11:27:35.604',
        \`DigTreasureNoPrizeCount\` = 1,
        \`DigTreasureDrawCount\` = 4,
        \`IntegralExchangeSendName\` = NULL,
        \`IntegralExchangeSendPhone\` = NULL,
        \`IntegralExchangeSendAddress\` = NULL,
        \`DayResetTaskData\` = '{\"38\":{\"Value\":5,\"HasGet\":true,\"GetCount\":5},\"23\":{\"Value\":1,\"HasGet\":true,\"GetCount\":0},\"15\":{\"Value\":10,\"HasGet\":true,\"GetCount\":1},\"16\":{\"Value\":30,\"HasGet\":true,\"GetCount\":1},\"17\":{\"Value\":60,\"HasGet\":true,\"GetCount\":1},\"22\":{\"Value\":1,\"HasGet\":false,\"GetCount\":0}}',
        \`NotDayResetTaskData\` = '{\"27\":{\"Value\":1,\"HasGet\":true,\"GetCount\":0},\"34\":{\"Value\":1,\"HasGet\":true,\"GetCount\":0},\"28\":{\"Value\":1,\"HasGet\":true,\"GetCount\":0},\"18\":{\"Value\":1,\"HasGet\":false,\"GetCount\":0},\"45\":{\"Value\":1,\"HasGet\":true,\"GetCount\":1}}',
        \`Id\` = 12345
      WHERE
        \`Id\` = 12345
      LIMIT
        1;
    `);
  });
});
