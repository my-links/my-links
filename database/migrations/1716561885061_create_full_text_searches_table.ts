import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  async up() {
    this.schema.raw(`
      CREATE EXTENSION IF NOT EXISTS unaccent;
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
    `);
    this.schema.raw(`
      CREATE INDEX ON links USING gin(to_tsvector('english', name));
      CREATE INDEX ON collections USING gin(to_tsvector('english', name));
      CREATE INDEX ON links USING gin(to_tsvector('french', name));
      CREATE INDEX ON collections USING gin(to_tsvector('french', name));
    `);
    this.schema.raw(`
      CREATE OR REPLACE FUNCTION search_text(search_query TEXT, p_author_id INTEGER)
      RETURNS TABLE (
          id INTEGER,
          type TEXT,
          name VARCHAR(254),
          collection_id INTEGER,
          matched_part TEXT,
          rank DOUBLE PRECISION
      )
      AS $$
      BEGIN
          RETURN QUERY
          SELECT links.id, 'link' AS type, links.name, collections.id AS collection_id,
                ts_headline('english', unaccent(links.name), plainto_tsquery('english', unaccent(search_query))) AS matched_part,
                ts_rank_cd(to_tsvector('english', unaccent(links.name)), plainto_tsquery('english', unaccent(search_query)))::DOUBLE PRECISION AS rank
          FROM links
          LEFT JOIN collections ON links.collection_id = collections.id
          WHERE unaccent(links.name) ILIKE '%' || unaccent(search_query) || '%'
            AND (p_author_id IS NULL OR links.author_id = p_author_id)
          UNION ALL
          SELECT collections.id, 'collection' AS type, collections.name, NULL AS collection_id,
                ts_headline('english', unaccent(collections.name), plainto_tsquery('english', unaccent(search_query))) AS matched_part,
                ts_rank_cd(to_tsvector('english', unaccent(collections.name)), plainto_tsquery('english', unaccent(search_query)))::DOUBLE PRECISION AS rank
          FROM collections
          WHERE unaccent(collections.name) ILIKE '%' || unaccent(search_query) || '%'
            AND (p_author_id IS NULL OR collections.author_id = p_author_id)
          ORDER BY rank DESC NULLS LAST, matched_part DESC NULLS LAST;
      END;
      $$
      LANGUAGE plpgsql;
    `);
  }

  async down() {
    this.schema.raw('DROP FUNCTION IF EXISTS search_text');
  }
}
