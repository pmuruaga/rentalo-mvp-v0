import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProfileAbout } from "@/components/publisher/ProfileAbout";
import { ProfileHeader } from "@/components/publisher/ProfileHeader";
import { ProfileListings } from "@/components/publisher/ProfileListings";
import { ProfileReviews } from "@/components/publisher/ProfileReviews";
import { ProfileStats } from "@/components/publisher/ProfileStats";
import { Button } from "@/components/ui/button";
import { getCurrentUserProfile } from "@/lib/currentUserProfile";
import { siteName, siteUrl } from "@/lib/site";
import {
  getPublisherActiveListings,
  getPublisherPublicProfile,
  getPublisherReceivedReviews,
} from "@/lib/publisherPublic";

function absoluteProfileUrl(id: string): string {
  const base = siteUrl.replace(/\/$/, "");
  const path = `/publicador/${id}`;
  return base ? `${base}${path}` : path;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const publisher = await getPublisherPublicProfile(id);
  if (!publisher) {
    return { title: "Publicador no encontrado" };
  }

  const title = `${publisher.displayName} en ${siteName}`;
  const description = `Conocé las publicaciones, reputación y opiniones de ${publisher.displayName} en ${siteName}.`;
  const image =
    publisher.image && /^https?:\/\//i.test(publisher.image)
      ? publisher.image
      : undefined;

  return {
    title: publisher.displayName,
    description,
    openGraph: {
      title,
      description,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function PublicadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const publisher = await getPublisherPublicProfile(id);

  if (!publisher) {
    notFound();
  }

  const [listings, reviews, currentUser] = await Promise.all([
    getPublisherActiveListings(id),
    getPublisherReceivedReviews(id),
    getCurrentUserProfile(),
  ]);

  const isOwnProfile = currentUser?.id === publisher.id;
  const shareUrl = absoluteProfileUrl(publisher.id);

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-8 sm:py-10">
      <Button variant="ghost" asChild className="-ml-2">
        <Link
          href="/catalogo"
          className="text-[var(--brand-primary)] hover:text-[var(--brand-primary)]/80"
        >
          ← Volver al catálogo
        </Link>
      </Button>

      <ProfileHeader
        publisher={publisher}
        shareUrl={shareUrl}
        isOwnProfile={isOwnProfile}
      />

      <ProfileStats publisher={publisher} />

      <ProfileAbout publisher={publisher} />

      <ProfileListings
        displayName={publisher.displayName}
        listings={listings}
      />

      <ProfileReviews
        reviews={reviews}
        ratingAverage={publisher.ratingAverage}
        ratingCount={publisher.ratingCount}
      />
    </div>
  );
}
