"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin, Phone, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectAllSalons,
  selectSalonsNextToken,
  listSalons,
  deleteSalon,
} from "@/store/slices/salon.slice";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SalonsListSkeleton from "@/components/skeletons/SalonsListSkeleton";
import {
  selectSalonsListStatus,
  type Status,
} from "@/store/slices/salon.slice";
import {
  selectAllEmployees,
  listEmployees,
} from "@/store/slices/employees.slice";
import { selectAllBeats, listBeats } from "@/store/slices/beats.slice";
import ComboboxBeats from "@/components/employees/ComboboxBeats";
import ComboboxUsers from "@/components/employees/ComboboxUsers";

export default function SalonTable() {
  const dispatch = useAppDispatch();
  const salons = useAppSelector(selectAllSalons);
  const nextToken = useAppSelector(selectSalonsNextToken);
  const listStatus: Status = useAppSelector(selectSalonsListStatus);
  const employees = useAppSelector(selectAllEmployees);
  const beats = useAppSelector(selectAllBeats);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedUserId, setSelectedUserId] = React.useState<string>("all");
  const [selectedBeatId, setSelectedBeatId] = React.useState<string>("");

  // Load employees and beats for filter dropdowns
  React.useEffect(() => {
    dispatch(listEmployees({ limit: 500, mode: "replace" }));
    dispatch(listBeats({ limit: 10, mode: "replace" }));
  }, [dispatch]);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  React.useEffect(() => {
    // @ts-ignore
    dispatch(
      listSalons({
        limit: 20,
        mode: "replace",
        search: debouncedSearch || undefined,
        userId:
          selectedUserId && selectedUserId !== "all"
            ? selectedUserId
            : undefined,
        beatId: selectedBeatId || undefined,
      })
    );
  }, [dispatch, debouncedSearch, selectedUserId, selectedBeatId]);

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "?";
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Salons</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search salons by name, address, phone, or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <ComboboxUsers
              value={selectedUserId}
              onChange={setSelectedUserId}
              options={
                employees?.map((emp) => ({
                  id: emp.sub,
                  name: emp.name,
                  email: emp.email,
                  profileImage: emp.profileImage,
                })) || []
              }
              placeholder="All users"
              showAllOption={true}
            />
            {selectedUserId && selectedUserId !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUserId("all")}
              >
                Clear
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ComboboxBeats
              value={selectedBeatId}
              onChange={setSelectedBeatId}
              options={
                beats?.slice(0, 10).map((beat) => ({
                  id: beat.id,
                  name: beat.beatname,
                  code: beat.code,
                })) || []
              }
              placeholder="All beats"
            />
            {selectedBeatId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBeatId("")}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of compact cards */}
      {listStatus === "loading" ? (
        <SalonsListSkeleton />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {salons?.map((s) => {
            return (
              <Link key={s.id} href={`/salons/${s.id}`} className="block">
                <Card className="transition-shadow shadow-sm hover:shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-semibold line-clamp-1">
                        {s.name || "Untitled"}
                      </CardTitle>
                    </div>
                    {/* State badge */}
                    {s.state && (
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline" className="capitalize">
                          {s.state}
                        </Badge>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-2">
                    {/* Address / phone mini rows */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="line-clamp-1">
                        {s.address || s.state || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 shrink-0" />
                      <span>{s.mobile || "—"}</span>
                    </div>

                    {/* Creator */}
                    {s.createdByUser && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <Avatar className="w-6 h-6">
                          <AvatarImage
                            src={s.createdByUser.profileImage}
                            alt={s.createdByUser.name || s.createdByUser.email}
                          />
                          <AvatarFallback className="text-xs">
                            {getInitials(
                              s.createdByUser.name,
                              s.createdByUser.email
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">
                            {s.createdByUser.name ||
                              s.createdByUser.email ||
                              "—"}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {(!salons || salons.length === 0) &&
            (listStatus === "idle" ||
              listStatus === "succeeded" ||
              listStatus === "failed") && (
              <div className="col-span-full text-center text-sm text-muted-foreground py-8">
                No salons yet.
              </div>
            )}
        </div>
      )}

      {/* Pagination */}
      {nextToken && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => {
              // @ts-ignore
              dispatch(
                listSalons({
                  limit: 20,
                  nextToken,
                  mode: "append",
                  search: debouncedSearch || undefined,
                  userId:
                    selectedUserId && selectedUserId !== "all"
                      ? selectedUserId
                      : undefined,
                  beatId: selectedBeatId || undefined,
                })
              );
            }}
          >
            Load more
          </Button>
        </div>
      )}
    </>
  );
}
