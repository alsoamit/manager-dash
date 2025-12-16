"use client";

import * as React from "react";
import { ChevronUp, ChevronDown, X, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectAllBeats,
  listBeats,
  getAssignedBeats,
  assignBeatsToUser,
  selectAssignedBeats,
  selectAssignedBeatsStatus,
  selectBeatAssignStatus,
} from "@/store/slices/beats.slice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MultiSelectComboboxBeats from "./MultiSelectComboboxBeats";
import toast from "react-hot-toast";

interface BeatAssignmentCardProps {
  userId: string;
}

export default function BeatAssignmentCard({
  userId,
}: BeatAssignmentCardProps) {
  const dispatch = useAppDispatch();
  const allBeats = useAppSelector(selectAllBeats);
  const assignedBeats = useAppSelector((s) => selectAssignedBeats(s, userId));
  const assignedStatus = useAppSelector((s) =>
    selectAssignedBeatsStatus(s, userId)
  );
  const assignStatus = useAppSelector(selectBeatAssignStatus);

  const [selectedBeatIds, setSelectedBeatIds] = React.useState<string[]>([]);
  const [localAssignedBeats, setLocalAssignedBeats] = React.useState<
    Array<{ beatId: string; order: number; beatname: string; code?: string }>
  >([]);

  // Load all beats and assigned beats
  React.useEffect(() => {
    dispatch(listBeats({ limit: 200, mode: "replace" }));
    dispatch(getAssignedBeats({ userId }));
  }, [dispatch, userId]);

  // Update local state when assigned beats change (only when status is succeeded and data actually changes)
  const assignedBeatsSerialized = React.useMemo(
    () =>
      JSON.stringify(
        assignedBeats?.map((b) => ({ beatId: b.id, order: b.order })) || []
      ),
    [assignedBeats]
  );

  React.useEffect(() => {
    if (assignedStatus !== "succeeded" || !assignedBeats) return;

    const newBeats =
      assignedBeats.length > 0
        ? assignedBeats.map((b) => ({
            beatId: b.id,
            order: b.order,
            beatname: b.beatname,
            code: b.code,
          }))
        : [];

    setLocalAssignedBeats((prev) => {
      const prevSerialized = JSON.stringify(
        prev.map((b) => ({ beatId: b.beatId, order: b.order }))
      );
      const newSerialized = JSON.stringify(
        newBeats.map((b) => ({ beatId: b.beatId, order: b.order }))
      );

      // Only update if content actually changed
      if (prevSerialized !== newSerialized) {
        return newBeats;
      }
      return prev;
    });
  }, [assignedBeatsSerialized, assignedStatus]);

  // Handle assignment success
  React.useEffect(() => {
    if (assignStatus === "succeeded") {
      toast.success("Beats assigned successfully");
      dispatch(getAssignedBeats({ userId })); // Refresh
    }
    if (assignStatus === "failed") {
      toast.error("Failed to assign beats");
    }
  }, [assignStatus, dispatch, userId]);

  const availableBeats = allBeats.filter(
    (beat) => !localAssignedBeats.some((ab) => ab.beatId === beat.id)
  );

  const handleAddBeats = () => {
    if (selectedBeatIds.length === 0) return;

    // Filter out beats that are already assigned (prevent duplicates)
    const newBeatIds = selectedBeatIds.filter(
      (beatId) => !localAssignedBeats.some((ab) => ab.beatId === beatId)
    );

    if (newBeatIds.length === 0) {
      toast.error("All selected beats are already assigned");
      setSelectedBeatIds([]);
      return;
    }

    // Get beat details for new beats
    const newBeats = newBeatIds
      .map((beatId) => {
        const beat = allBeats.find((b) => b.id === beatId);
        if (!beat) return null;
        return {
          beatId: beat.id,
          beatname: beat.beatname,
          code: beat.code,
        };
      })
      .filter(Boolean) as Array<{
      beatId: string;
      beatname: string;
      code?: string;
    }>;

    // Calculate starting order
    const currentMaxOrder =
      localAssignedBeats.length > 0
        ? Math.max(...localAssignedBeats.map((b) => b.order))
        : -1;

    // Add new beats with sequential orders
    const beatsToAdd = newBeats.map((beat, index) => ({
      ...beat,
      order: currentMaxOrder + 1 + index,
    }));

    setLocalAssignedBeats([...localAssignedBeats, ...beatsToAdd]);
    setSelectedBeatIds([]);

    if (newBeatIds.length < selectedBeatIds.length) {
      toast.success(
        `Added ${newBeatIds.length} beat(s). ${
          selectedBeatIds.length - newBeatIds.length
        } beat(s) were already assigned.`
      );
    } else {
      toast.success(`Added ${newBeatIds.length} beat(s)`);
    }
  };

  const handleRemoveBeat = (beatId: string) => {
    setLocalAssignedBeats(
      localAssignedBeats
        .filter((b) => b.beatId !== beatId)
        .map((b, idx) => ({ ...b, order: idx }))
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newBeats = [...localAssignedBeats];
    [newBeats[index - 1], newBeats[index]] = [
      newBeats[index],
      newBeats[index - 1],
    ];
    setLocalAssignedBeats(newBeats.map((b, idx) => ({ ...b, order: idx })));
  };

  const handleMoveDown = (index: number) => {
    if (index === localAssignedBeats.length - 1) return;
    const newBeats = [...localAssignedBeats];
    [newBeats[index], newBeats[index + 1]] = [
      newBeats[index + 1],
      newBeats[index],
    ];
    setLocalAssignedBeats(newBeats.map((b, idx) => ({ ...b, order: idx })));
  };

  const handleSave = () => {
    const payload = {
      userId,
      beats: localAssignedBeats.map((b) => ({
        beatId: b.beatId,
        order: b.order,
      })),
    };
    dispatch(assignBeatsToUser(payload));
  };

  const isLoading = assignStatus === "loading";

  // Memoize hasChanges calculation to prevent unnecessary re-renders
  const hasChanges = React.useMemo(() => {
    const localSerialized = JSON.stringify(
      localAssignedBeats.map((b) => ({ beatId: b.beatId, order: b.order }))
    );
    const assignedSerialized = JSON.stringify(
      assignedBeats?.map((b) => ({ beatId: b.id, order: b.order })) || []
    );
    return localSerialized !== assignedSerialized;
  }, [localAssignedBeats, assignedBeats]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned Beats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Beats */}
        <div className="space-y-2">
          {availableBeats.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground border rounded-md bg-muted/20">
              No beats available
            </div>
          ) : (
            <>
              <MultiSelectComboboxBeats
                value={selectedBeatIds}
                onChange={setSelectedBeatIds}
                options={availableBeats.map((beat) => ({
                  id: beat.id,
                  name: beat.beatname,
                  code: beat.code,
                }))}
                placeholder="Select beats to add (multiple selection)"
                disabled={isLoading}
              />
              <Button
                onClick={handleAddBeats}
                disabled={selectedBeatIds.length === 0 || isLoading}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add{" "}
                {selectedBeatIds.length > 0 ? `${selectedBeatIds.length} ` : ""}
                Beat{selectedBeatIds.length !== 1 ? "s" : ""}
              </Button>
            </>
          )}
        </div>

        {/* Assigned Beats List */}
        {localAssignedBeats.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No beats assigned. Add beats using the selector above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {localAssignedBeats
              .sort((a, b) => a.order - b.order)
              .map((beat, index) => (
                <div
                  key={beat.beatId}
                  className="flex items-center gap-2 p-2 border rounded-md"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Badge variant="outline" className="shrink-0">
                      #{beat.order + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {beat.beatname}
                      </div>
                      {beat.code && (
                        <div className="text-xs text-muted-foreground">
                          {beat.code}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0 || isLoading}
                      className="h-8 w-8"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveDown(index)}
                      disabled={
                        index === localAssignedBeats.length - 1 || isLoading
                      }
                      className="h-8 w-8"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveBeat(beat.beatId)}
                      disabled={isLoading}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Save Button */}
        {hasChanges && (
          <div className="flex justify-end pt-2 border-t">
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
