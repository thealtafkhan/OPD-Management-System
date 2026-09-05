package com.amu.opd.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "departments")
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    private String description;
    private String floorLocation;
    private String roomRange;
    private boolean active = true;

    public Department() {}

    public Department(String name, String description, String floorLocation, String roomRange) {
        this.name = name;
        this.description = description;
        this.floorLocation = floorLocation;
        this.roomRange = roomRange;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getFloorLocation() { return floorLocation; }
    public void setFloorLocation(String floorLocation) { this.floorLocation = floorLocation; }
    public String getRoomRange() { return roomRange; }
    public void setRoomRange(String roomRange) { this.roomRange = roomRange; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
