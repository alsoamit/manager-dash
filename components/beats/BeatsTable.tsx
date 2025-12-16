"use client";

import * as React from "react";
import {
  Plus,
  MapPin,
  Search,
  Store,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectAllBeats,
  listBeats,
  selectBeatsListStatus,
} from "@/store/slices/beats.slice";
import { useAdmin } from "@/hooks/useAdmin";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";

import CreateBeatModal from "./CreateBeatModal";
import BeatsListSkeleton from "@/components/skeletons/BeatsListSkeleton";

type SortField = "name" | "salonCount" | null;
type SortDirection = "asc" | "desc";

export default function BeatsTable() {
  const dispatch = useAppDispatch();
  const allBeats = useAppSelector(selectAllBeats);
  const listStatus = useAppSelector(selectBeatsListStatus);
  const { isAdmin } = useAdmin();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortField, setSortField] = React.useState<SortField>(null);
  const [sortDirection, setSortDirection] =
    React.useState<SortDirection>("asc");

  // Load all beats at once, only once, with salon counts for admin
  React.useEffect(() => {
    if (isAdmin && allBeats.length === 0 && listStatus !== "loading") {
      dispatch(
        listBeats({
          limit: 500,
          mode: "replace",
          includeSalonCounts: isAdmin,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // Client-side search filtering and sorting
  const filteredAndSortedBeats = React.useMemo(() => {
    let filtered = allBeats;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = allBeats.filter(
        (beat) =>
          beat.beatname?.toLowerCase().includes(query) ||
          beat.code?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let comparison = 0;

        if (sortField === "name") {
          const nameA = (a.beatname || "").toLowerCase();
          const nameB = (b.beatname || "").toLowerCase();
          comparison = nameA.localeCompare(nameB);
        } else if (sortField === "salonCount") {
          const countA = a.salonCount ?? 0;
          const countB = b.salonCount ?? 0;
          comparison = countA - countB;
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [allBeats, searchQuery, sortField, sortDirection]);

  // Calculate total salon count
  const totalSalonCount = React.useMemo(() => {
    return allBeats.reduce((sum, beat) => sum + (beat.salonCount ?? 0), 0);
  }, [allBeats]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Set new field with default direction
      // Salon count defaults to descending, name defaults to ascending
      setSortField(field);
      setSortDirection(field === "salonCount" ? "desc" : "asc");
    }
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Beats</h2>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-muted-foreground">
              Manage your beat routes.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">
                  {allBeats.length}
                </span>{" "}
                beat{allBeats.length !== 1 ? "s" : ""}
              </span>
              {isAdmin && (
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {totalSalonCount}
                  </span>{" "}
                  salon{totalSalonCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Beat
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search beats by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Sort Buttons */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        <Button
          variant={sortField === "name" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSort("name")}
          className="gap-2"
        >
          {sortField === "name" ? (
            sortDirection === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )
          ) : (
            <ArrowUpDown className="w-4 h-4" />
          )}
          Name
        </Button>
        <Button
          variant={sortField === "salonCount" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSort("salonCount")}
          className="gap-2"
        >
          {sortField === "salonCount" ? (
            sortDirection === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )
          ) : (
            <ArrowUpDown className="w-4 h-4" />
          )}
          Salon Count
        </Button>
        {sortField && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSortField(null);
              setSortDirection("asc");
            }}
            className="text-xs"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Grid of beat cards */}
      {listStatus === "loading" && (!allBeats || allBeats.length === 0) ? (
        <BeatsListSkeleton />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredAndSortedBeats?.map((b) => {
            const salonCount = b.salonCount ?? 0;
            return (
              <Link key={b.id} href={`/beats/${b.id}`} className="block">
                <Card className="transition-shadow shadow-sm hover:shadow cursor-pointer h-full px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded bg-muted shrink-0 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-semibold line-clamp-2 leading-tight">
                          {b.beatname || "Untitled"}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {b.code && (
                            <Badge variant="secondary" className="text-xs">
                              {b.code}
                            </Badge>
                          )}
                          {b.state && (
                            <Badge variant="outline" className="text-xs">
                              {b.state}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Store className="w-4 h-4" />
                      <span>
                        {listStatus === "loading"
                          ? "..."
                          : `${salonCount} salon${salonCount !== 1 ? "s" : ""}`}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}

          {(!filteredAndSortedBeats || filteredAndSortedBeats.length === 0) &&
            listStatus !== "loading" && (
              <div className="col-span-full text-center text-sm text-muted-foreground py-8">
                {searchQuery
                  ? "No beats match your search."
                  : "No beats found."}
              </div>
            )}
        </div>
      )}

      <CreateBeatModal open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
