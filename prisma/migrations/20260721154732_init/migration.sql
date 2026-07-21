-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('INGESTED', 'DRAFTING', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('NEWS', 'COMPARISON', 'RANKING', 'GUIDE', 'TOOL_PROFILE');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('APPROVED', 'REJECTED', 'REVISION_NEEDED');

-- CreateEnum
CREATE TYPE "ScoreConfidence" AS ENUM ('VERIFIED', 'COMMUNITY', 'ESTIMATED', 'PLACEHOLDER');

-- CreateEnum
CREATE TYPE "ModelStatus" AS ENUM ('ACTIVE', 'DEPRECATED', 'BETA', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "ToolPricingModel" AS ENUM ('FREE', 'FREEMIUM', 'SUBSCRIPTION', 'PAY_PER_USE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "AffiliateType" AS ENUM ('CPA', 'CPC', 'HYBRID');

-- CreateEnum
CREATE TYPE "LegalDocType" AS ENUM ('AVISO_LEGAL', 'PRIVACIDAD', 'COOKIES', 'POLITICA_EDITORIAL', 'AFILIACION', 'TERMINOS');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EDITOR', 'REVIEWER');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'PUBLISH', 'UNPUBLISH', 'DELETE', 'REVIEW_SUBMIT', 'SCORE_UPDATE', 'LOGIN');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('RSS', 'API', 'MANUAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EDITOR',
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "SourceType" NOT NULL DEFAULT 'RSS',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastFetchAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL DEFAULT 'NEWS',
    "status" "ArticleStatus" NOT NULL DEFAULT 'INGESTED',
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT,
    "sourceId" TEXT,
    "sourceUrl" TEXT,
    "sourcePublishedAt" TIMESTAMP(3),
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImageUrl" TEXT,
    "canonicalUrl" TEXT,
    "relevanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "keyPoints" TEXT[],

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_models" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "developer" TEXT NOT NULL,
    "version" TEXT,
    "releaseDate" TIMESTAMP(3),
    "status" "ModelStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT NOT NULL,
    "logoUrl" TEXT,
    "officialUrl" TEXT,
    "contextWindow" INTEGER,
    "supportsVision" BOOLEAN NOT NULL DEFAULT false,
    "supportsTools" BOOLEAN NOT NULL DEFAULT false,
    "supportsCode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tools" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "pricingModel" "ToolPricingModel" NOT NULL,
    "startingPrice" DOUBLE PRECISION,
    "hasFreeplan" BOOLEAN NOT NULL DEFAULT false,
    "trialDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "modelId" TEXT,

    CONSTRAINT "ai_tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "use_cases" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT,

    CONSTRAINT "use_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scoring_criteria" (
    "id" TEXT NOT NULL,
    "useCaseId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "higherIsBetter" BOOLEAN NOT NULL DEFAULT true,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,

    CONSTRAINT "scoring_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model_scores" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "useCaseId" TEXT NOT NULL,
    "criteriaId" TEXT NOT NULL,
    "rawValue" DOUBLE PRECISION,
    "normalizedScore" DOUBLE PRECISION,
    "confidence" "ScoreConfidence" NOT NULL DEFAULT 'PLACEHOLDER',
    "sourceUrl" TEXT,
    "sourceDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "model_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparisons" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImageUrl" TEXT,

    CONSTRAINT "comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rankings" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "useCaseId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,

    CONSTRAINT "rankings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories_on_articles" (
    "articleId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "categories_on_articles_pkey" PRIMARY KEY ("articleId","categoryId")
);

-- CreateTable
CREATE TABLE "tags_on_articles" (
    "articleId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "tags_on_articles_pkey" PRIMARY KEY ("articleId","tagId")
);

-- CreateTable
CREATE TABLE "ai_models_on_articles" (
    "articleId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,

    CONSTRAINT "ai_models_on_articles_pkey" PRIMARY KEY ("articleId","modelId")
);

-- CreateTable
CREATE TABLE "models_on_comparisons" (
    "comparisonId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "models_on_comparisons_pkey" PRIMARY KEY ("comparisonId","modelId")
);

-- CreateTable
CREATE TABLE "categories_on_comparisons" (
    "comparisonId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "categories_on_comparisons_pkey" PRIMARY KEY ("comparisonId","categoryId")
);

-- CreateTable
CREATE TABLE "tags_on_comparisons" (
    "comparisonId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "tags_on_comparisons_pkey" PRIMARY KEY ("comparisonId","tagId")
);

-- CreateTable
CREATE TABLE "models_on_rankings" (
    "rankingId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "models_on_rankings_pkey" PRIMARY KEY ("rankingId","modelId")
);

-- CreateTable
CREATE TABLE "tags_on_rankings" (
    "rankingId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "tags_on_rankings_pkey" PRIMARY KEY ("rankingId","tagId")
);

-- CreateTable
CREATE TABLE "use_cases_on_tools" (
    "toolId" TEXT NOT NULL,
    "useCaseId" TEXT NOT NULL,

    CONSTRAINT "use_cases_on_tools_pkey" PRIMARY KEY ("toolId","useCaseId")
);

-- CreateTable
CREATE TABLE "categories_on_tools" (
    "toolId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "categories_on_tools_pkey" PRIMARY KEY ("toolId","categoryId")
);

-- CreateTable
CREATE TABLE "publication_queue" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "publication_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editorial_reviews" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decision" "ReviewDecision" NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "editorial_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_links" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "type" "AffiliateType" NOT NULL,
    "partner" TEXT NOT NULL,
    "commission" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modelId" TEXT,
    "toolId" TEXT,

    CONSTRAINT "affiliate_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "consentIp" TEXT NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consentVersion" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "unsubscribedAt" TIMESTAMP(3),
    "segments" TEXT[],

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_documents" (
    "id" TEXT NOT NULL,
    "type" "LegalDocType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cookie_consents" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "analytics" BOOLEAN NOT NULL DEFAULT false,
    "advertising" BOOLEAN NOT NULL DEFAULT false,
    "functional" BOOLEAN NOT NULL DEFAULT true,
    "consentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipHash" TEXT NOT NULL,
    "policyVersion" TEXT NOT NULL,

    CONSTRAINT "cookie_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sources_url_key" ON "sources"("url");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "articles_sourceUrl_key" ON "articles"("sourceUrl");

-- CreateIndex
CREATE INDEX "articles_status_publishedAt_idx" ON "articles"("status", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "articles_contentType_status_idx" ON "articles"("contentType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ai_models_slug_key" ON "ai_models"("slug");

-- CreateIndex
CREATE INDEX "ai_models_developer_idx" ON "ai_models"("developer");

-- CreateIndex
CREATE UNIQUE INDEX "ai_tools_slug_key" ON "ai_tools"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ai_tools_modelId_key" ON "ai_tools"("modelId");

-- CreateIndex
CREATE UNIQUE INDEX "use_cases_slug_key" ON "use_cases"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "scoring_criteria_useCaseId_slug_key" ON "scoring_criteria"("useCaseId", "slug");

-- CreateIndex
CREATE INDEX "model_scores_modelId_useCaseId_idx" ON "model_scores"("modelId", "useCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "model_scores_modelId_useCaseId_criteriaId_key" ON "model_scores"("modelId", "useCaseId", "criteriaId");

-- CreateIndex
CREATE UNIQUE INDEX "comparisons_slug_key" ON "comparisons"("slug");

-- CreateIndex
CREATE INDEX "comparisons_publishedAt_idx" ON "comparisons"("publishedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "rankings_slug_key" ON "rankings"("slug");

-- CreateIndex
CREATE INDEX "rankings_publishedAt_idx" ON "rankings"("publishedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "publication_queue_articleId_key" ON "publication_queue"("articleId");

-- CreateIndex
CREATE INDEX "publication_queue_priority_addedAt_idx" ON "publication_queue"("priority" DESC, "addedAt");

-- CreateIndex
CREATE INDEX "editorial_reviews_articleId_idx" ON "editorial_reviews"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_links_slug_key" ON "affiliate_links"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "legal_documents_type_key" ON "legal_documents"("type");

-- CreateIndex
CREATE UNIQUE INDEX "cookie_consents_sessionToken_key" ON "cookie_consents"("sessionToken");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tools" ADD CONSTRAINT "ai_tools_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ai_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scoring_criteria" ADD CONSTRAINT "scoring_criteria_useCaseId_fkey" FOREIGN KEY ("useCaseId") REFERENCES "use_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_scores" ADD CONSTRAINT "model_scores_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ai_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_scores" ADD CONSTRAINT "model_scores_useCaseId_fkey" FOREIGN KEY ("useCaseId") REFERENCES "use_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_scores" ADD CONSTRAINT "model_scores_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "scoring_criteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rankings" ADD CONSTRAINT "rankings_useCaseId_fkey" FOREIGN KEY ("useCaseId") REFERENCES "use_cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories_on_articles" ADD CONSTRAINT "categories_on_articles_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories_on_articles" ADD CONSTRAINT "categories_on_articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_articles" ADD CONSTRAINT "tags_on_articles_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_articles" ADD CONSTRAINT "tags_on_articles_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_models_on_articles" ADD CONSTRAINT "ai_models_on_articles_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_models_on_articles" ADD CONSTRAINT "ai_models_on_articles_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ai_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "models_on_comparisons" ADD CONSTRAINT "models_on_comparisons_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "comparisons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "models_on_comparisons" ADD CONSTRAINT "models_on_comparisons_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ai_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories_on_comparisons" ADD CONSTRAINT "categories_on_comparisons_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "comparisons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories_on_comparisons" ADD CONSTRAINT "categories_on_comparisons_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_comparisons" ADD CONSTRAINT "tags_on_comparisons_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "comparisons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_comparisons" ADD CONSTRAINT "tags_on_comparisons_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "models_on_rankings" ADD CONSTRAINT "models_on_rankings_rankingId_fkey" FOREIGN KEY ("rankingId") REFERENCES "rankings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "models_on_rankings" ADD CONSTRAINT "models_on_rankings_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ai_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_rankings" ADD CONSTRAINT "tags_on_rankings_rankingId_fkey" FOREIGN KEY ("rankingId") REFERENCES "rankings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_rankings" ADD CONSTRAINT "tags_on_rankings_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "use_cases_on_tools" ADD CONSTRAINT "use_cases_on_tools_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "ai_tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "use_cases_on_tools" ADD CONSTRAINT "use_cases_on_tools_useCaseId_fkey" FOREIGN KEY ("useCaseId") REFERENCES "use_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories_on_tools" ADD CONSTRAINT "categories_on_tools_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "ai_tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories_on_tools" ADD CONSTRAINT "categories_on_tools_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_queue" ADD CONSTRAINT "publication_queue_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editorial_reviews" ADD CONSTRAINT "editorial_reviews_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editorial_reviews" ADD CONSTRAINT "editorial_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_links" ADD CONSTRAINT "affiliate_links_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ai_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_links" ADD CONSTRAINT "affiliate_links_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "ai_tools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
