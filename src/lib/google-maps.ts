/**
 * Google Maps/Places API 유틸리티
 * 약국 정보를 Google Maps에서 검색하여 보완 정보를 가져옵니다.
 */

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || GOOGLE_MAPS_API_KEY;

export type GoogleMapsPlaceInfo = {
  placeId?: string;
  name?: string;
  formattedAddress?: string;
  rating?: number;
  userRatingsTotal?: number;
  openingHours?: {
    openNow?: boolean;
    weekdayText?: string[];
  };
  photos?: Array<{ photoReference: string }>;
  reviews?: Array<{
    authorName: string;
    rating: number;
    text: string;
    time: number;
  }>;
  website?: string;
  internationalPhoneNumber?: string;
  businessStatus?: string;
  types?: string[];
  vicinity?: string;
};

/**
 * Google Places API를 사용하여 약국 정보 검색
 * 참고: https://developers.google.com/maps/documentation/places/web-service
 */
export async function searchPharmacyOnGoogleMaps(
  pharmacyName: string,
  address: string,
): Promise<GoogleMapsPlaceInfo | null> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn("GOOGLE_PLACES_API_KEY가 설정되지 않았습니다.");
    return null;
  }

  try {
    // 1. Text Search로 약국 검색
    const searchQuery = `${pharmacyName} ${address}`;
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_PLACES_API_KEY}&language=ko&region=kr`;

    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      console.error("Google Places API search failed:", searchResponse.status);
      return null;
    }

    const searchData = (await searchResponse.json()) as {
      results?: Array<{
        place_id: string;
        name: string;
        formatted_address: string;
        rating?: number;
        user_ratings_total?: number;
        opening_hours?: {
          open_now?: boolean;
          weekday_text?: string[];
        };
        photos?: Array<{ photo_reference: string }>;
        types?: string[];
        vicinity?: string;
      }>;
      status?: string;
    };

    if (searchData.status !== "OK" || !searchData.results || searchData.results.length === 0) {
      console.warn("Google Maps에서 약국을 찾을 수 없습니다:", searchQuery);
      return null;
    }

    // 가장 관련성 높은 결과 선택 (첫 번째 결과)
    const place = searchData.results[0];
    if (!place.place_id) {
      return null;
    }

    // 2. Place Details로 상세 정보 가져오기
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${GOOGLE_PLACES_API_KEY}&language=ko&fields=name,formatted_address,rating,user_ratings_total,opening_hours,photos,reviews,website,international_phone_number,business_status,types,vicinity`;

    const detailsResponse = await fetch(detailsUrl);
    if (!detailsResponse.ok) {
      console.error("Google Places API details failed:", detailsResponse.status);
      // 검색 결과만 반환
      return {
        placeId: place.place_id,
        name: place.name,
        formattedAddress: place.formatted_address,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        openingHours: place.opening_hours
          ? {
              openNow: place.opening_hours.open_now,
              weekdayText: place.opening_hours.weekday_text,
            }
          : undefined,
        types: place.types,
        vicinity: place.vicinity,
      };
    }

    const detailsData = (await detailsResponse.json()) as {
      result?: {
        name: string;
        formatted_address: string;
        rating?: number;
        user_ratings_total?: number;
        opening_hours?: {
          open_now?: boolean;
          weekday_text?: string[];
        };
        photos?: Array<{ photo_reference: string }>;
        reviews?: Array<{
          author_name: string;
          rating: number;
          text: string;
          time: number;
        }>;
        website?: string;
        international_phone_number?: string;
        business_status?: string;
        types?: string[];
        vicinity?: string;
      };
      status?: string;
    };

    if (detailsData.status !== "OK" || !detailsData.result) {
      return null;
    }

    const result = detailsData.result;

    return {
      placeId: place.place_id,
      name: result.name,
      formattedAddress: result.formatted_address,
      rating: result.rating,
      userRatingsTotal: result.user_ratings_total,
      openingHours: result.opening_hours
        ? {
            openNow: result.opening_hours.open_now,
            weekdayText: result.opening_hours.weekday_text,
          }
        : undefined,
      photos: result.photos?.map((p) => ({ photoReference: p.photo_reference })),
      reviews: result.reviews?.map((r) => ({
        authorName: r.author_name,
        rating: r.rating,
        text: r.text,
        time: r.time,
      })),
      website: result.website,
      internationalPhoneNumber: result.international_phone_number,
      businessStatus: result.business_status,
      types: result.types,
      vicinity: result.vicinity,
    };
  } catch (error) {
    console.error("Google Maps 검색 오류:", error);
    return null;
  }
}

/**
 * Google Maps 정보를 텍스트로 포맷팅 (Gemini 프롬프트에 사용)
 */
export function formatGoogleMapsInfoForPrompt(info: GoogleMapsPlaceInfo): string {
  const parts: string[] = [];

  if (info.name) {
    parts.push(`- 이름: ${info.name}`);
  }
  if (info.formattedAddress) {
    parts.push(`- 주소: ${info.formattedAddress}`);
  }
  if (info.rating !== undefined) {
    parts.push(`- 평점: ${info.rating}/5.0 (${info.userRatingsTotal || 0}개 리뷰)`);
  }
  if (info.internationalPhoneNumber) {
    parts.push(`- 전화번호: ${info.internationalPhoneNumber}`);
  }
  if (info.website) {
    parts.push(`- 웹사이트: ${info.website}`);
  }
  if (info.businessStatus) {
    parts.push(`- 영업 상태: ${info.businessStatus}`);
  }
  if (info.openingHours?.weekdayText) {
    parts.push(`- 영업시간 (Google Maps):`);
    info.openingHours.weekdayText.forEach((text) => {
      parts.push(`  ${text}`);
    });
  }
  if (info.reviews && info.reviews.length > 0) {
    parts.push(`- 최근 리뷰 (${info.reviews.length}개):`);
    info.reviews.slice(0, 3).forEach((review, idx) => {
      parts.push(`  ${idx + 1}. [${review.rating}/5] ${review.text.substring(0, 100)}...`);
    });
  }
  if (info.types) {
    parts.push(`- 카테고리: ${info.types.join(", ")}`);
  }

  return parts.length > 0 ? parts.join("\n") : "";
}

